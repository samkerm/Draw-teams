export let Random = {
    get key() {
        return (Math.random() * 10000).toString()
    }
};