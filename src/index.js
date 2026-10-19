import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

function setup() {
    const spaceX = new SpaceX();

    Promise.all([spaceX.launches(), spaceX.launchpads()])
        .then(([launches, launchpads]) => {
            const pads = launchpads.filter(pad =>
                pad.latitude != null && pad.longitude != null
            );

            const padIds = new Set(pads.map(pad => String(pad.id)));

            const spaceXLaunches = launches.filter(launch =>
                padIds.has(String(launch.pad?.id))
            );

            const usedIds = new Set(
                spaceXLaunches.map(launch => String(launch.pad.id))
            );

            renderLaunches(spaceXLaunches,document.getElementById("listContainer"));
            drawMap(pads.filter(pad => usedIds.has(String(pad.id))));
        })
        .catch(error => console.error("Ошибка загрузки:", error));
}

function renderLaunches(launches, container){
    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = document.createElement("li");
        item.textContent = launch.name;

        const padId = launch.pad?.id;
        item.dataset.padId = padId ?? "";

        item.addEventListener("mouseenter", () => {highlightLaunchpad(padId);});
        item.addEventListener("mouseleave", () => {highlightLaunchpad(null);});

        list.appendChild(item);
    })
    container.replaceChildren(list);
}

function drawMap(launchpads) {
    const width = 640;
    const height = 480;

    const svg = d3.select("#map")
        .append("svg")
        .attr("width", width + 110)
        .attr("height", height + 60)
        .append("g")
        .attr("transform", "translate(100,20)");

    const projection = d3.geoMercator()
        .scale(100)
        .center([0, 20])
        .translate([width / 2 - 100, height / 2]);

    const geoPath = d3.geoPath().projection(projection);

    svg.selectAll("path")
        .data((Geo.default ?? Geo).features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", geoPath)
        .attr("fill", "#dce6ed")
        .style("opacity", 0.7);

    svg.selectAll("circle")
        .data(launchpads)
        .enter()
        .append("circle")
        .attr("class", "launchpad-dot")
        .attr("cx", pad => projection([+pad.longitude, +pad.latitude])[0])
        .attr("cy", pad => projection([+pad.longitude, +pad.latitude])[1])
        .attr("r", 5)
        .attr("fill", "steelblue");
}

function highlightLaunchpad(padId) {
    d3.selectAll(".launchpad-dot")
        .classed("active", pad => padId != null && String(pad.id) === String(padId))
        .attr("r", pad => padId != null && String(pad.id) === String(padId) ? 8 : 5);
}