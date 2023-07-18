export class ListOf<T> {
    private items: Array<T>;

    constructor() {
        this.items = [];
    }

    public count(): number {
        return this.items.length;
    }

    public add(value: T): void {
        this.items.push(value);
    }

    public get(index: number): T {
        return this.items[index];
    }
}