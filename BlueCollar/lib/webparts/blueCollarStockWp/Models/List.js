export class ListOf {
    constructor() {
        this.items = [];
    }
    count() {
        return this.items.length;
    }
    add(value) {
        this.items.push(value);
    }
    get(index) {
        return this.items[index];
    }
}
//# sourceMappingURL=List.js.map