interface Vouch {
    source: string; // ID of the vouch author
    target: string; // ID of the mentioned user in vouch
    content: string; // exact vouch content
    date: Date; // message date

    getSource(): string
    getTarget(): string 
    getContent(): string 
    getDate(): Date 
}