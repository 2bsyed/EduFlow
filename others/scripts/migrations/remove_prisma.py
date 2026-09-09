import os
import re

FILES = [
    "src/app/(app)/attendance/page.tsx",
    "src/app/(app)/student/attendance/page.tsx",
    "src/app/(app)/student/notices/page.tsx",
    "src/app/(app)/student/page.tsx",
    "src/app/(app)/student/timetable/page.tsx",
    "src/app/(app)/notices/page.tsx",
    "src/app/(app)/dashboard/page.tsx",
    "src/app/(app)/teacher/profile/page.tsx",
    "src/app/(app)/teacher/batches/[batchId]/page.tsx",
    "src/app/(app)/teacher/batches/page.tsx",
    "src/app/(app)/teacher/page.tsx",
    "src/app/(app)/teacher/timetable/page.tsx",
    "src/actions/attendance.ts",
    "src/app/(app)/settings/language/page.tsx",
    "src/app/(app)/settings/page.tsx"
]

for file_path in FILES:
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove prisma import
    content = re.sub(r'import \{ prisma \} from "@/lib/db/prisma";\n?', '', content)
    
    # ensure fetchApi is imported if not present
    if "fetchApi" not in content and ("const institute = await" in content or "await prisma" in content):
        if 'import { fetchApi }' not in content:
            content = 'import { fetchApi } from "@/lib/api";\n' + content

    # simple replacements for standard prisma queries
    # e.g. prisma.institute.findUnique({ where: { id: instituteId } }) => fetchApi(`/api/v1/institutes/${instituteId}`)
    content = re.sub(
        r'await prisma\.institute\.findUnique\(\{\s*where:\s*\{\s*id:\s*instituteId\s*\},?\s*\}\)',
        r'await fetchApi(`/api/v1/institutes/${instituteId}`)',
        content
    )
    
    # wait, sometimes it's just const institute = await prisma.institute.findUnique(...) without instituteId, like in dashboard
    content = re.sub(
        r'await prisma\.institute\.findUnique\(\{\s*where:\s*\{\s*id:\s*[a-zA-Z0-9_\.]+\s*\},?\s*\}\)',
        r'await fetchApi("/api/v1/core/settings/profile")',
        content
    )
    
    content = re.sub(
        r'await prisma\.batch\.findMany\(\{.*?\}\)',
        r'await fetchApi("/api/v1/batches/")',
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(
        r'await prisma\.student\.findFirst\(\{.*?\}\)',
        r'await fetchApi("/api/v1/students/me")',
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r'await prisma\.student\.findMany\(\{.*?\}\)',
        r'await fetchApi("/api/v1/students/")',
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r'await prisma\.teacher\.findUnique\(\{.*?\}\)',
        r'await fetchApi("/api/v1/teachers/me")',
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(
        r'await prisma\.teacher\.findFirst\(\{.*?\}\)',
        r'await fetchApi("/api/v1/teachers/me")',
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r'await prisma\.batch\.findFirst\(\{.*?\}\)',
        r'await fetchApi(`/api/v1/batches/${batchId}`)',
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(
        r'await prisma\.batch\.findUnique\(\{.*?\}\)',
        r'await fetchApi(`/api/v1/batches/${batchId}`)',
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(
        r'await prisma\.studentBatch\.findMany\(\{.*?\}\)',
        r'await fetchApi(`/api/v1/batches/${selectedBatchId}/students`)',
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(
        r'await prisma\.attendance\.findMany\(\{.*?\}\)',
        r'await fetchApi(`/api/v1/attendance?batchId=${selectedBatchId}&date=${parsedDate.toISOString()}`)',
        content,
        flags=re.DOTALL
    )
    
    content = re.sub(
        r'await prisma\.attendance\.upsert\(\{.*?\}\)',
        r'await fetchApi(`/api/v1/attendance/upsert`, { method: "POST", body: JSON.stringify({ ...arguments }) })',
        content,
        flags=re.DOTALL
    )
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Done")
