class VouchModel implements Vouch{
    source: string; // ID of the vouch author
    target: string; // ID of the mentioned user in vouch
    content: string; // exact vouch content
    date: Date; // message date

    constructor(source: string, target: string, content: string, date: Date) {
        this.source = source;
        this.target = target;
        this.content = content;
        this.date = date;
    }

    getSource(): string {
        return this.source;
    }

    getTarget(): string {
        return this.target;
    }

    getContent(): string {
        return this.content;
    }

    getDate(): Date {
        return this.date;
    }
}