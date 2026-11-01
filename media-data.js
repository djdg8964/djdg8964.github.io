(function (root) {
    function normalizeSnapshot(snapshot) {
        const rows = (snapshot.rows || []).map(row => ({...row, event_id: String(row.event_id), category_ids: (row.category_ids || []).map(String)}));
        const eventById = new Map(rows.map(row => [row.event_id, row]));
        let images = snapshot.media;
        if (!Array.isArray(images)) {
            const byImage = new Map();
            for (const event of rows) for (const image of event.images || []) {
                const key = image.filename || String(image.id);
                if (!byImage.has(key)) byImage.set(key, {...image, events: []});
                const target = byImage.get(key);
                if (!target.events.some(item => item.event_id === event.event_id)) {
                    target.events.push({event_id: event.event_id, title: event.title});
                }
            }
            images = [...byImage.values()];
        }
        const media = images.map(image => {
            const categories = Array.isArray(image.categories) ? image.categories : image.category ? [{category_id: image.category, category_name: image.category}] : [];
            const events = (Array.isArray(image.events) ? image.events : image.event_id == null ? [] : [{event_id: image.event_id, title: image.event_title}])
                .map(event => ({...event, event_id: String(event.event_id), title: event.title || eventById.get(String(event.event_id))?.title || ''}));
            return {...image, categories, events,
                category_ids: categories.map(item => String(item.category_id)),
                event_ids: events.map(item => item.event_id),
                category: categories.map(item => item.category_name).join('、'),
                event_title: events.map(item => item.title).join('、')
            };
        });
        return {...snapshot, rows, media};
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = {normalizeSnapshot};
    else root.normalizeSnapshot = normalizeSnapshot;
})(globalThis);
