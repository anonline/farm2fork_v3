export default class EmailBaseTemplate {
    subject: string;
    body: string;
    header: string;
    footer: string;

    constructor() {
        this.subject = '';
        this.body = '';
        this.header = defaultHeader;
        this.footer = defaultFooter;
    }

    setSubject(subject: string) {
        this.subject = subject;
    }

    setBody(body: string) {
        this.body = body;
    }

    setHeader(header: string) {
        this.header = header;
    }
    setFooter(footer: string) {
        this.footer = footer;
    }
}

const defaultHeader = `F2F header`;
const defaultFooter = `F2F footer`;
