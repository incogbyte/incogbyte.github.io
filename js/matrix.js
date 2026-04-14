// Matrix / Terminal code rain effect in purple
(function () {
  const canvas = document.getElementById('matrix-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Code snippets that scroll in the background
  const codeSnippets = [
    'if (vuln != null) exploit();',
    'nmap -sV -p- target',
    'frida -U -f com.app',
    'objection explore',
    'adb shell pm list',
    'curl -X POST /api',
    'SELECT * FROM users',
    'chmod 777 /tmp/shell',
    'reverse_tcp LHOST=',
    'msfconsole -q',
    'gobuster dir -u',
    'hydra -l admin -P',
    'john --wordlist=',
    'sqlmap -u "http://',
    'nikto -h target',
    'binwalk firmware.bin',
    'gdb ./binary',
    'r2 -A ./malware',
    'tcpdump -i eth0',
    'wireshark -k -i',
    'openssl s_client',
    'ssh -L 8080:localhost',
    'python3 exploit.py',
    'jadx -d output app.apk',
    'flutter_decrypt(key)',
    'bypass_ssl_pinning()',
    'def reverse_shell():',
    '0xDEADBEEF',
    'mov eax, [ebp+8]',
    'xor rdi, rdi',
    'push rbp; mov rbp rsp',
    'CVE-2024-XXXX',
    'import frida',
    'const hook = Interceptor',
    'Java.perform(function(){',
    'Process.enumerateModules',
    'Memory.readByteArray(ptr',
    '#!/bin/bash',
    'root@kali:~#',
    'GET /admin HTTP/1.1',
    'Authorization: Bearer',
    'X-Forwarded-For: 127.0',
    'Content-Type: application',
    'while True: scan()',
    'hashcat -m 1000 -a 0',
    'certutil -urlcache',
    'powershell -ep bypass',
    'base64 -d payload.b64',
  ];

  let width, height, columns, drops;
  const fontSize = 14;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = Array.from({ length: columns }, () => Math.random() * -100);
  }

  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.06)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < columns; i++) {
      // Alternate between purple shades
      const purples = [
        'rgba(124, 58, 237, 0.9)',
        'rgba(167, 139, 250, 0.7)',
        'rgba(192, 132, 252, 0.6)',
        'rgba(109, 40, 217, 0.8)',
        'rgba(139, 92, 246, 0.75)',
      ];
      ctx.fillStyle = purples[Math.floor(Math.random() * purples.length)];

      // Pick a random character from code snippets
      const snippet = codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
      const char = snippet[Math.floor(Math.random() * snippet.length)];

      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(char, x, y);

      // Occasionally render a full snippet fragment
      if (Math.random() > 0.995) {
        ctx.fillStyle = 'rgba(167, 139, 250, 0.4)';
        const frag = snippet.substring(0, 15);
        ctx.fillText(frag, x, y + fontSize);
      }

      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    requestAnimationFrame(draw);
  }

  // Start after a small delay
  setTimeout(draw, 100);
})();
