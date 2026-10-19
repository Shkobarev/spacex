class SpaceX{

    constructor(baseUrl = "https://ll.thespacedevs.com/2.3.0/") {
        this.baseUrl = baseUrl;
    }

    async request(url) {
        const cached = localStorage.getItem(url);

        if (cached) {
            const { timestamp, data } = JSON.parse(cached);

            if (Date.now() - timestamp < 3600000) {
                return data;
            }
        }

        const response = await fetch(url);
        const data = await response.json();

        localStorage.setItem(url, JSON.stringify({timestamp: Date.now(),data}));

        return data;
    }

    launches() {
        return this.request(`${this.baseUrl}launches/?lsp__name=SpaceX&limit=100`)
        .then(data => data.results);
    }

    async launchpads() {
        let url = `${this.baseUrl}pads/?limit=100`;
        const pads = [];

        while (url) {
            const data = await this.request(url);
            pads.push(...data.results);
            url = data.next;
        }

        return pads;
    }

    launchpad(id) {
        return this.request(`${this.baseUrl}pads/${id}/`);
    }
}

export {SpaceX}
