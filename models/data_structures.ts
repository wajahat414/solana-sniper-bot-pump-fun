interface IStack<T> {
    push(item: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    size(): number;
  }

  


  export class Stack<T> implements IStack<T> {
    private storage: T[] = [];
  
    constructor(private capacity: number = Infinity) {}
  
    push(item: T): void {
      if (this.size() === this.capacity) {
        throw Error("Stack has reached max capacity, you cannot add more items");
      }
      this.storage.push(item);
    }
  
    pop(): T | undefined {
      return this.storage.pop();
    }
  
    peek(): T | undefined {
      return this.storage[this.size() - 1];
    }
  
    size(): number {
      return this.storage.length;
    }
  }


  export class SetWithContentEquality<T> {
    private items: T[] = [];
    private getKey: (item: T) => string;
    constructor(getKey: (item: T) => string) {
        this.getKey = getKey;
    }
    add(item: T): void {
        const key = this.getKey(item);
        if (!this.items.some(existing => this.getKey(existing) === key)) {
            this.items.push(item);
        }
    }
    has(item: T): boolean {
        return this.items.some(existing => this.getKey(existing) === this.getKey(item));
    }
    values(): T[] {
        return [...this.items];
    }
}


