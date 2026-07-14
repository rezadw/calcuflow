import re
import os

files_to_fix = {
    'src/App.tsx': [("import React", "import")],
    'src/components/auth/RegisterForm.tsx': [("type DosenFormData =", "// type DosenFormData =")],
    'src/pages/CalcuMindPage.tsx': [("const user = useAuthStore(state => state.user);", "// const user = useAuthStore(state => state.user);"), ("const isEnrolled = useAuthStore(state => state.isEnrolled);", "// const isEnrolled = useAuthStore(state => state.isEnrolled);")],
    'src/pages/CalcuQuestPage.tsx': [("import React", "import"), ("const isEnrolled = useAuthStore(state => state.isEnrolled);", "// const isEnrolled = useAuthStore(state => state.isEnrolled);"), ("const [activeTab, setActiveTab]", "// const [activeTab, setActiveTab]")],
    'src/pages/CalcuSimPage.tsx': [("const user = useAuthStore(state => state.user);", "// const user = useAuthStore(state => state.user);"), ("const isEnrolled = useAuthStore(state => state.isEnrolled);", "// const isEnrolled = useAuthStore(state => state.isEnrolled);"), ("const compiledExpr = math.compile(expr);", "// const compiledExpr = math.compile(expr);")],
    'src/pages/DosenAnalyticsPage.tsx': [("const mockMetrics", "// const mockMetrics")],
    'src/pages/DosenDashboardPage.tsx': [("import React, { useEffect", "import { useEffect"), ("IconX", "// IconX")],
    'src/pages/ModulePage.tsx': [("import React, { useState", "import { useState"), ("type Chapter =", "// type Chapter ="), ("type QuizQuestion =", "// type QuizQuestion ="), ("const user = useAuthStore(state => state.user);", "// const user = useAuthStore(state => state.user);"), ("const isEnrolled = useAuthStore(state => state.isEnrolled);", "// const isEnrolled = useAuthStore(state => state.isEnrolled);")],
    'src/pages/PretestPage.tsx': [("import React, { useState", "import { useState")]
}

for file, replacements in files_to_fix.items():
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        if old == "import React":
            content = re.sub(r'import\s+React\s*,?\s*', 'import ', content)
        else:
            content = content.replace(old, new)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
