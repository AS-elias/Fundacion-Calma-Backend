const fs = require('fs');
const p = 'src/modules/dashboard/dashboard.service.ts';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/categoras/g, 'categor\\u00EDas');
c = c.replace(/REUNI"N/g, 'REUNI\\u00D3N');
c = c.replace(/s mismo/g, 's\\u00ED mismo');
c = c.replace(/ǭreas/g, '\\u00E1reas');
c = c.replace(/vǭlido/g, 'v\\u00E1lido');
c = c.replace(/evaluacin/g, 'evaluaci\\u00F3n');
c = c.replace(/bǭsico/g, 'b\\u00E1sico');
c = c.replace(/informacin/g, 'informaci\\u00F3n');
c = c.replace(/Estǭndar/g, 'Est\\u00E1ndar');
c = c.replace(/mǸtricas/g, 'm\\u00E9tricas');
c = c.replace(/anǭlisis/g, 'an\\u00E1lisis');
c = c.replace(/condicin/g, 'condici\\u00F3n');
c = c.replace(/segǧn/g, 'seg\\u00FAn');
c = c.replace(/actualiz/g, 'actualiz\\u00F3');
c = c.replace(/REUNIN/g, 'REUNI\\u00D3N');
c = c.replace(/actualiz[Ã³]+ el estado a/g, 'actualiz\\u00F3 el estado a');

fs.writeFileSync(p, c);
console.log('Fixed encodings');
