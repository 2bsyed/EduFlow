import fs from 'fs';

let content = fs.readFileSync('src/app/(marketing)/page.tsx', 'utf8');

content = content.replace(
  /<div className="flex items-center gap-2">\s*<Icon name="school" className="text-primary text-\[28px\]" \/>\s*<span className="font-h3 text-h3 font-bold text-primary tracking-tight">EduFlow<\/span>\s*<\/div>/,
  `<Link href="/" className="flex items-center">\n            <Image src="/images/logo.jpg" alt="EduFlow logo" width={140} height={40} className="object-contain -ml-2" />\n          </Link>`
);

content = content.replace(
  /<Link href="\/" className="font-h3 text-h3 font-bold text-primary">\s*EduFlow\s*<\/Link>/,
  `<Link href="/">\n              <Image src="/images/logo.jpg" alt="EduFlow logo" width={140} height={40} className="object-contain -ml-2" />\n            </Link>`
);

fs.writeFileSync('src/app/(marketing)/page.tsx', content);
console.log('Updated marketing page');
