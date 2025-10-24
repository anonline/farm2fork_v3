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

    generateHTML(): string {
        return `
        <html>
                <head>
                    <meta charset="utf-8">
                    <title>${this.subject}</title>
                </head>
                <body>
        <div style="background-color:rgb(245,245,245);padding:0px;text-align:center" bgcolor="#f5f5f5">
            <table width="100%" style="background-color:rgb(245,245,245)" bgcolor="#f5f5f5">
                <tbody>
                    <tr>
                        <td></td>
                        <td width="600">
                            <div style="margin:0px auto;padding:70px 0px;width:100%;max-width:600px" width="100%">
                                <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
                                    <tbody>
                                        <tr>
                                            <td align="center" valign="top">
                                                <!-- Header Image -->
                                                <div>
                                                    <p style="margin-top:0px">
                                                        <img src="https://farm2fork.hu/assets/logo/f2fsingle.png" 
                                                             alt="Farm2Fork" 
                                                             style="border: none; display: inline-block; font-size: 14px; font-weight: bold; height: auto; outline: none; text-decoration: none; text-transform: capitalize; vertical-align: middle; max-width: 100%; margin-left: 0px; margin-right: 0px;" 
                                                             border="0">
                                                    </p>
                                                </div>
                                                
                                                <!-- Main Container -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" 
                                                       style="background-color:rgb(255,255,255);border:1px solid rgb(220,220,220);border-radius:3px" 
                                                       bgcolor="#fff">
                                                    <tbody>
                                                        <!-- Header Section -->
                                                        <tr>
                                                            <td align="center" valign="top">
                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" 
                                                                       style="background-color:rgb(74,110,80);color:rgb(255,255,255);border-bottom:0px;font-weight:bold;line-height:100%;vertical-align:middle;font-family:&quot;Helvetica Neue&quot;,Helvetica,Roboto,Arial,sans-serif;border-radius:3px 3px 0px 0px" 
                                                                       bgcolor="#4a6e50">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="padding:36px 48px;display:block">
                                                                                <h1 style="font-family:&quot;Helvetica Neue&quot;,Helvetica,Roboto,Arial,sans-serif;font-size:30px;font-weight:300;line-height:150%;margin:0px;text-align:left;color:rgb(255,255,255);background-color:inherit">
                                                                                    ${this.header}
                                                                                </h1>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        
                                                        <!-- Body Section -->
                                                        <tr>
                                                            <td align="center" valign="top">
                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td valign="top" style="background-color:rgb(255,255,255)" bgcolor="#fff">
                                                                                <table border="0" cellpadding="20" cellspacing="0" width="100%">
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td valign="top" style="padding:48px 48px 32px">
                                                                                                <div style="color:rgb(81,81,81);font-family:&quot;Helvetica Neue&quot;,Helvetica,Roboto,Arial,sans-serif;font-size:14px;line-height:150%;text-align:left">
                                                                                                    ${this.body}
                                                                                                </div>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        
                                        <!-- Footer Section -->
                                        <tr>
                                            <td align="center" valign="top">
                                                <table border="0" cellpadding="10" cellspacing="0" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td valign="top" style="padding:0px;border-radius:6px">
                                                                <table border="0" cellpadding="10" cellspacing="0" width="100%">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td colspan="2" valign="middle" 
                                                                                style="border-radius:6px;border:0px;font-family:&quot;Helvetica Neue&quot;,Helvetica,Roboto,Arial,sans-serif;font-size:12px;line-height:150%;text-align:center;padding:24px 0px;color:rgb(38,38,38)" 
                                                                                align="center">
                                                                                <p style="margin:0px 0px 16px">${this.footer}</p>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
        </body>
        </html>
        `;
    }
}

const defaultHeader = `Köszönjük a rendelést`;
const defaultFooter = `Farm2Fork`;
