import fs from 'fs';

// 1. Update Login
let login = fs.readFileSync('src/app/(marketing)/login/page.tsx', 'utf8');

if (!login.includes('import Image from "next/image"')) {
  login = login.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport Image from "next/image";'
  );
}

login = login.replace(
  /<div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container\/10 rounded-lg mb-lg">\s*<Icon name="school" className="text-\[32px\] text-primary" \/>\s*<\/div>/,
  `<div className="flex justify-center mb-md">\n              <Image src="/images/logo.jpg" alt="EduFlow logo" width={180} height={60} className="object-contain" />\n            </div>`
);

fs.writeFileSync('src/app/(marketing)/login/page.tsx', login);
console.log('Updated login page');

// 2. Update all Mobile Headers
// Mobile headers often look like: <div className="md:hidden font-h4 text-h4 font-bold text-primary">EduFlow</div>
const mobilePages = [
  'src/app/(app)/attendance/page.tsx',
  'src/app/(app)/dashboard/page.tsx',
  'src/app/(app)/fees/page.tsx',
  'src/app/(app)/results/page.tsx',
  'src/app/(app)/students/page.tsx',
  'src/app/(app)/teacher/page.tsx',
];

for (const p of mobilePages) {
  if (!fs.existsSync(p)) continue;
  let pageContent = fs.readFileSync(p, 'utf8');
  
  if (!pageContent.includes('import Image from "next/image"')) {
    pageContent = pageContent.replace(
      'import { Icon } from "@/components/ui/Icon";',
      'import { Icon } from "@/components/ui/Icon";\nimport Image from "next/image";'
    );
  }

  // Some are <h1 className="font-h3 text-h3 font-bold text-primary">EduFlow</h1> in teacher/page.tsx
  if (p === 'src/app/(app)/teacher/page.tsx') {
    pageContent = pageContent.replace(
      /<h1 className="font-h3 text-h3 font-bold text-primary">EduFlow<\/h1>/,
      `<div className="flex items-center">\n              <Image src="/images/logo.jpg" alt="EduFlow logo" width={100} height={32} className="object-contain -ml-2" />\n            </div>`
    );
  } else {
    pageContent = pageContent.replace(
      /<div className="md:hidden font-h4 text-h4 font-bold text-primary">EduFlow<\/div>/,
      `<div className="md:hidden flex items-center">\n              <Image src="/images/logo.jpg" alt="EduFlow logo" width={100} height={32} className="object-contain -ml-2" />\n            </div>`
    );
  }
  
  fs.writeFileSync(p, pageContent);
  console.log('Updated mobile header in ' + p);
}
