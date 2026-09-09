import fs from 'fs';

const files = [
  'src/components/layout/OwnerSidebar.tsx',
  'src/components/layout/StudentSidebar.tsx',
  'src/components/layout/TeacherSidebar.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add Image import if not exists
  if (!content.includes('import Image from "next/image"')) {
    content = content.replace(
      'import Link from "next/link";',
      'import Link from "next/link";\nimport Image from "next/image";'
    );
  }
  
  // Replace the logo block
  // Use regex to find the block
  const blockRegex = /<div className="mb-xl px-sm flex items-center gap-sm">[\s\S]*?<div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shrink-0">[\s\S]*?<Icon name="school" className="text-\[20px\]" \/>[\s\S]*?<\/div>[\s\S]*?<div className="overflow-hidden">[\s\S]*?<h1 className="font-h3 text-h3 font-bold text-primary truncate">EduFlow<\/h1>[\s\S]*?<p className="font-caption text-caption text-on-surface-variant truncate">([\s\S]*?)<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>/m;
  
  content = content.replace(blockRegex, `<div className="mb-xl px-sm flex flex-col items-start gap-xs">
        <Image src="/images/logo.jpg" alt="EduFlow logo" width={120} height={40} className="object-contain -ml-2" />
        <p className="font-caption text-caption text-on-surface-variant truncate w-full">$1</p>
      </div>`);
      
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
