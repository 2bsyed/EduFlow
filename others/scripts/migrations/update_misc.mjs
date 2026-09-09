import fs from 'fs';

const files = [
  'src/app/(marketing)/demo/page.tsx',
  'src/app/(marketing)/register/page.tsx'
];

for (const p of files) {
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');
  
  if (!content.includes('import Image from "next/image"')) {
    content = content.replace(
      'import Link from "next/link";',
      'import Link from "next/link";\nimport Image from "next/image";'
    );
  }

  content = content.replace(
    /<span className="font-h3 text-h3 text-primary font-bold">EduFlow<\/span>/,
    `<Link href="/">\n              <Image src="/images/logo.jpg" alt="EduFlow logo" width={140} height={40} className="object-contain -ml-2" />\n            </Link>`
  );
  
  fs.writeFileSync(p, content);
  console.log('Updated ' + p);
}

// RecordPaymentModal
let modal = fs.readFileSync('src/components/fees/RecordPaymentModal.tsx', 'utf8');
if (!modal.includes('import Image from "next/image"')) {
  modal = modal.replace(
    'import { Icon } from "@/components/ui/Icon";',
    'import { Icon } from "@/components/ui/Icon";\nimport Image from "next/image";'
  );
}
modal = modal.replace(
  /<h3 className="font-h3 text-h3 font-bold text-primary mb-1">EduFlow<\/h3>/,
  `<Image src="/images/logo.jpg" alt="EduFlow logo" width={100} height={32} className="object-contain mb-1" />`
);
fs.writeFileSync('src/components/fees/RecordPaymentModal.tsx', modal);
console.log('Updated RecordPaymentModal.tsx');

