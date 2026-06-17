import { Difficulty, PrismaClient, TaskStatus } from "@prisma/client";
import { computeDuplicateHash } from "../lib/duplicates";
import { localStorageService } from "../lib/storage/local";

const prisma = new PrismaClient();

const categories = [
  ["Неопределённые интегралы", "indefinite-integrals", "Первообразные и базовые методы интегрирования."],
  ["Определённые интегралы", "definite-integrals", "Вычисление интегралов на отрезках."],
  ["Несобственные интегралы", "improper-integrals", "Интегралы с бесконечными пределами и особенностями."],
  ["Двойные интегралы", "double-integrals", "Интегрирование по плоским областям."],
  ["Тройные интегралы", "triple-integrals", "Интегралы по пространственным областям."],
  ["Криволинейные интегралы", "line-integrals", "Интегралы по кривым и контурам."],
  ["Поверхностные интегралы", "surface-integrals", "Интегралы по поверхностям."],
  ["Интегралы с параметром", "parameter-integrals", "Зависимость интеграла от параметра."],
  ["Другие интегралы", "other-integrals", "Смешанные и нестандартные задачи."]
] as const;

type SeedTask = {
  number: number;
  categorySlug: string;
  difficulty: Difficulty;
  conditionMarkdown: string;
  expressionLatex: string;
  answerMarkdown: string;
  solutionMarkdown: string;
  source?: string;
  diagram?: { fileName: string; alt: string; svg: string };
};

const source = "Демонстрационная база Integral Hub";

const tasks: SeedTask[] = [
  {
    number: 1,
    categorySlug: "indefinite-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Найдите неопределённый интеграл степенной функции.",
    expressionLatex: "\\int x^2\\,dx",
    answerMarkdown: "$\\frac{x^3}{3}+C$",
    solutionMarkdown: "Используем правило $\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C$ при $n\\ne -1$.\n\n$$\\int x^2\\,dx=\\frac{x^3}{3}+C.$$",
    source
  },
  {
    number: 2,
    categorySlug: "indefinite-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Найдите первообразную суммы элементарных функций.",
    expressionLatex: "\\int (3x^2-4x+5)\\,dx",
    answerMarkdown: "$x^3-2x^2+5x+C$",
    solutionMarkdown: "Интегрируем каждое слагаемое отдельно:\n\n$$\\int 3x^2dx=x^3,\\quad \\int -4x\\,dx=-2x^2,\\quad \\int 5\\,dx=5x.$$\n\nИтого $x^3-2x^2+5x+C$.",
    source
  },
  {
    number: 3,
    categorySlug: "indefinite-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите интеграл заменой переменной.",
    expressionLatex: "\\int 2x\\cos(x^2)\\,dx",
    answerMarkdown: "$\\sin(x^2)+C$",
    solutionMarkdown: "Положим $u=x^2$, тогда $du=2x\\,dx$.\n\n$$\\int 2x\\cos(x^2)\\,dx=\\int \\cos u\\,du=\\sin u+C=\\sin(x^2)+C.$$",
    source
  },
  {
    number: 4,
    categorySlug: "indefinite-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите интеграл по частям.",
    expressionLatex: "\\int x e^x\\,dx",
    answerMarkdown: "$e^x(x-1)+C$",
    solutionMarkdown: "Берём $u=x$, $dv=e^x dx$. Тогда $du=dx$, $v=e^x$.\n\n$$\\int x e^x dx=xe^x-\\int e^x dx=xe^x-e^x+C=e^x(x-1)+C.$$",
    source
  },
  {
    number: 5,
    categorySlug: "definite-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Вычислите определённый интеграл.",
    expressionLatex: "\\int_0^1 2x\\,dx",
    answerMarkdown: "$1$",
    solutionMarkdown: "Первообразная функции $2x$ равна $x^2$.\n\n$$\\int_0^1 2x\\,dx=x^2\\big|_0^1=1-0=1.$$",
    source
  },
  {
    number: 6,
    categorySlug: "definite-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Вычислите площадь под графиком синуса на отрезке.",
    expressionLatex: "\\int_0^{\\pi} \\sin x\\,dx",
    answerMarkdown: "$2$",
    solutionMarkdown: "Первообразная $\\sin x$ равна $-\\cos x$.\n\n$$\\int_0^{\\pi}\\sin x\\,dx=-\\cos x\\big|_0^{\\pi}=1-(-1)=2.$$",
    source
  },
  {
    number: 7,
    categorySlug: "definite-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите интеграл чётной функции.",
    expressionLatex: "\\int_{-1}^{1} (x^2+1)\\,dx",
    answerMarkdown: "$\\frac{8}{3}$",
    solutionMarkdown: "Функция чётная, поэтому можно удвоить интеграл от $0$ до $1$:\n\n$$2\\int_0^1(x^2+1)dx=2\\left(\\frac{1}{3}+1\\right)=\\frac{8}{3}.$$",
    source
  },
  {
    number: 8,
    categorySlug: "definite-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите интеграл с логарифмом.",
    expressionLatex: "\\int_0^1 \\ln(1+x)\\,dx",
    answerMarkdown: "$2\\ln 2-1$",
    solutionMarkdown: "Интегрируем по частям: $u=\\ln(1+x)$, $dv=dx$.\n\n$$\\int \\ln(1+x)dx=x\\ln(1+x)-\\int\\frac{x}{1+x}dx.$$\n\nТак как $\\frac{x}{1+x}=1-\\frac{1}{1+x}$, получаем первообразную $(1+x)\\ln(1+x)-x$. На $[0,1]$ это $2\\ln2-1$.",
    source
  },
  {
    number: 9,
    categorySlug: "improper-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Проверьте сходимость и вычислите интеграл.",
    expressionLatex: "\\int_1^{\\infty}\\frac{1}{x^2}\\,dx",
    answerMarkdown: "$1$",
    solutionMarkdown: "Переходим к пределу:\n\n$$\\int_1^b x^{-2}dx=\\left[-\\frac1x\\right]_1^b=1-\\frac1b.$$\n\nПри $b\\to\\infty$ получаем $1$.",
    source
  },
  {
    number: 10,
    categorySlug: "improper-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите несобственный интеграл на полуоси.",
    expressionLatex: "\\int_0^{\\infty} e^{-x}\\,dx",
    answerMarkdown: "$1$",
    solutionMarkdown: "$$\\int_0^b e^{-x}dx=1-e^{-b}.$$\n\nПри $b\\to\\infty$ экспонента стремится к нулю, поэтому интеграл равен $1$.",
    source
  },
  {
    number: 11,
    categorySlug: "improper-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите интеграл с особенностью в нуле.",
    expressionLatex: "\\int_0^1 \\frac{1}{\\sqrt{x}}\\,dx",
    answerMarkdown: "$2$",
    solutionMarkdown: "Записываем $x^{-1/2}$ и берём предел:\n\n$$\\int_a^1 x^{-1/2}dx=2\\sqrt{x}\\big|_a^1=2-2\\sqrt a.$$\n\nПри $a\\to0+$ получаем $2$.",
    source
  },
  {
    number: 12,
    categorySlug: "improper-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите классический интеграл на всей прямой.",
    expressionLatex: "\\int_{-\\infty}^{\\infty}\\frac{1}{1+x^2}\\,dx",
    answerMarkdown: "$\\pi$",
    solutionMarkdown: "Первообразная равна $\\arctan x$.\n\n$$\\int_{-a}^{a}\\frac{dx}{1+x^2}=\\arctan a-\\arctan(-a)=2\\arctan a.$$\n\nПри $a\\to\\infty$ получаем $\\pi$.",
    source
  },
  {
    number: 13,
    categorySlug: "double-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Вычислите двойной интеграл по прямоугольнику $0\\le x\\le1$, $0\\le y\\le2$.",
    expressionLatex: "\\int_0^1\\int_0^2 (x+y)\\,dy\\,dx",
    answerMarkdown: "$3$",
    solutionMarkdown: "Сначала интегрируем по $y$:\n\n$$\\int_0^2(x+y)dy=2x+2.$$\n\nЗатем $$\\int_0^1(2x+2)dx=1+2=3.$$",
    source,
    diagram: { fileName: "region-13.svg", alt: "Прямоугольная область интегрирования", svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 240 160\"><rect x=\"45\" y=\"35\" width=\"150\" height=\"90\" fill=\"#eef2ff\" stroke=\"#4f46e5\" stroke-width=\"3\"/><text x=\"105\" y=\"84\" font-size=\"18\" fill=\"#111827\">D</text><path d=\"M30 130H210M45 145V20\" stroke=\"#374151\"/><text x=\"190\" y=\"150\" font-size=\"12\">x</text><text x=\"28\" y=\"28\" font-size=\"12\">y</text></svg>" }
  },
  {
    number: 14,
    categorySlug: "double-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Вычислите интеграл по единичному квадрату.",
    expressionLatex: "\\int_0^1\\int_0^1 xy\\,dy\\,dx",
    answerMarkdown: "$\\frac14$",
    solutionMarkdown: "$$\\int_0^1 xy\\,dy=x\\frac{y^2}{2}\\bigg|_0^1=\\frac{x}{2}.$$\n\nДалее $$\\int_0^1\\frac{x}{2}dx=\\frac14.$$",
    source
  },
  {
    number: 15,
    categorySlug: "double-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите интеграл по треугольнику $0\\le y\\le x\\le1$.",
    expressionLatex: "\\int_0^1\\int_0^x y\\,dy\\,dx",
    answerMarkdown: "$\\frac16$",
    solutionMarkdown: "Внутренний интеграл равен $\\frac{x^2}{2}$.\n\n$$\\int_0^1\\frac{x^2}{2}dx=\\frac{1}{2}\\cdot\\frac13=\\frac16.$$",
    source,
    diagram: { fileName: "triangle-15.svg", alt: "Треугольная область y от 0 до x", svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 220 180\"><path d=\"M45 140H165L165 20Z\" fill=\"#ecfeff\" stroke=\"#0891b2\" stroke-width=\"3\"/><path d=\"M35 140H185M45 155V15\" stroke=\"#374151\"/><text x=\"120\" y=\"95\" font-size=\"18\" fill=\"#0f172a\">0≤y≤x</text></svg>" }
  },
  {
    number: 16,
    categorySlug: "double-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите интеграл по единичному кругу.",
    expressionLatex: "\\iint_{x^2+y^2\\le 1} (x^2+y^2)\\,dA",
    answerMarkdown: "$\\frac{\\pi}{2}$",
    solutionMarkdown: "Переходим к полярным координатам: $x^2+y^2=r^2$, $dA=r\\,dr\\,d\\varphi$.\n\n$$\\int_0^{2\\pi}\\int_0^1 r^3drd\\varphi=2\\pi\\cdot\\frac14=\\frac\\pi2.$$",
    source,
    diagram: { fileName: "disk-16.svg", alt: "Единичный круг", svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\"><circle cx=\"100\" cy=\"100\" r=\"70\" fill=\"#f0fdf4\" stroke=\"#16a34a\" stroke-width=\"3\"/><path d=\"M20 100H180M100 180V20\" stroke=\"#374151\"/><text x=\"110\" y=\"92\" font-size=\"14\">r≤1</text></svg>" }
  },
  {
    number: 17,
    categorySlug: "triple-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Вычислите тройной интеграл по единичному кубу.",
    expressionLatex: "\\int_0^1\\int_0^1\\int_0^1 1\\,dz\\,dy\\,dx",
    answerMarkdown: "$1$",
    solutionMarkdown: "Интеграл от единицы по области равен объёму области. Единичный куб имеет объём $1$.",
    source
  },
  {
    number: 18,
    categorySlug: "triple-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите интеграл $x+y+z$ по единичному кубу.",
    expressionLatex: "\\int_0^1\\int_0^1\\int_0^1 (x+y+z)\\,dz\\,dy\\,dx",
    answerMarkdown: "$\\frac32$",
    solutionMarkdown: "По симметрии интегралы от $x$, $y$ и $z$ по кубу равны $\\frac12$.\n\nСумма равна $\\frac12+\\frac12+\\frac12=\\frac32$.",
    source
  },
  {
    number: 19,
    categorySlug: "triple-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Найдите объём тетраэдра $x,y,z\\ge0$, $x+y+z\\le1$.",
    expressionLatex: "\\int_0^1\\int_0^{1-x}\\int_0^{1-x-y} 1\\,dz\\,dy\\,dx",
    answerMarkdown: "$\\frac16$",
    solutionMarkdown: "Интегрируем последовательно:\n\n$$\\int_0^{1-x-y}1dz=1-x-y.$$\n\n$$\\int_0^{1-x}(1-x-y)dy=\\frac{(1-x)^2}{2}.$$\n\n$$\\int_0^1\\frac{(1-x)^2}{2}dx=\\frac16.$$",
    source
  },
  {
    number: 20,
    categorySlug: "triple-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите интеграл по единичному шару.",
    expressionLatex: "\\iiint_{x^2+y^2+z^2\\le1} 1\\,dV",
    answerMarkdown: "$\\frac{4\\pi}{3}$",
    solutionMarkdown: "Это объём единичного шара. В сферических координатах:\n\n$$\\int_0^{2\\pi}\\int_0^{\\pi}\\int_0^1 \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta=2\\pi\\cdot2\\cdot\\frac13=\\frac{4\\pi}{3}.$$",
    source
  },
  {
    number: 21,
    categorySlug: "line-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Вычислите криволинейный интеграл первого рода по отрезку от $(0,0)$ до $(1,0)$.",
    expressionLatex: "\\int_C x\\,ds",
    answerMarkdown: "$\\frac12$",
    solutionMarkdown: "Параметризуем $C$: $r(t)=(t,0)$, $0\\le t\\le1$. Тогда $ds=dt$.\n\n$$\\int_C x\\,ds=\\int_0^1 t\\,dt=\\frac12.$$",
    source
  },
  {
    number: 22,
    categorySlug: "line-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите работу поля $P=x$, $Q=y$ вдоль четверти единичной окружности от $(1,0)$ до $(0,1)$.",
    expressionLatex: "\\int_C x\\,dx+y\\,dy",
    answerMarkdown: "$0$",
    solutionMarkdown: "Форма является дифференциалом $d\\left(\\frac{x^2+y^2}{2}\\right)$.\n\nНа единичной окружности значение потенциала в начале и конце одинаково, поэтому интеграл равен $0$.",
    source
  },
  {
    number: 23,
    categorySlug: "line-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите циркуляцию по единичной окружности против часовой стрелки.",
    expressionLatex: "\\oint_C -y\\,dx+x\\,dy",
    answerMarkdown: "$2\\pi$",
    solutionMarkdown: "Параметризуем окружность: $x=\\cos t$, $y=\\sin t$, $0\\le t\\le2\\pi$.\n\nТогда $dx=-\\sin tdt$, $dy=\\cos tdt$ и\n\n$$-y\\,dx+x\\,dy=\\sin^2t+\\cos^2t=1.$$\n\nИнтеграл равен $\\int_0^{2\\pi}dt=2\\pi$.",
    source
  },
  {
    number: 24,
    categorySlug: "surface-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите поверхностный интеграл первого рода по квадрату $0\\le x,y\\le1$ в плоскости $z=0$.",
    expressionLatex: "\\iint_S (x+y)\\,dS",
    answerMarkdown: "$1$",
    solutionMarkdown: "На плоскости $z=0$ имеем $dS=dxdy$.\n\n$$\\int_0^1\\int_0^1(x+y)dxdy=\\frac12+\\frac12=1.$$",
    source
  },
  {
    number: 25,
    categorySlug: "surface-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Найдите поток поля $F=(0,0,z)$ через верхнюю полусферу единичного шара наружу.",
    expressionLatex: "\\iint_S F\\cdot n\\,dS",
    answerMarkdown: "$\\frac{2\\pi}{3}$",
    solutionMarkdown: "На единичной сфере $n=(x,y,z)$, поэтому $F\\cdot n=z^2$. Для верхней полусферы $z=\\cos\\varphi$, $dS=\\sin\\varphi d\\varphi d\\theta$.\n\n$$\\int_0^{2\\pi}\\int_0^{\\pi/2}\\cos^2\\varphi\\sin\\varphi d\\varphi d\\theta=2\\pi\\cdot\\frac13=\\frac{2\\pi}{3}.$$",
    source,
    diagram: { fileName: "hemisphere-25.svg", alt: "Верхняя полусфера", svg: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 220 160\"><path d=\"M40 120C55 35 165 35 180 120Z\" fill=\"#fdf2f8\" stroke=\"#db2777\" stroke-width=\"3\"/><ellipse cx=\"110\" cy=\"120\" rx=\"70\" ry=\"18\" fill=\"none\" stroke=\"#9ca3af\"/><text x=\"82\" y=\"82\" font-size=\"14\">z ≥ 0</text></svg>" }
  },
  {
    number: 26,
    categorySlug: "surface-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите площадь боковой поверхности конуса $z=\\sqrt{x^2+y^2}$ при $0\\le z\\le1$.",
    expressionLatex: "\\iint_S 1\\,dS",
    answerMarkdown: "$\\pi\\sqrt{2}$",
    solutionMarkdown: "Параметризуем конус: $r,\\theta\\mapsto(r\\cos\\theta,r\\sin\\theta,r)$, $0\\le r\\le1$.\n\nМодуль векторного произведения равен $\\sqrt2 r$. Тогда\n\n$$\\int_0^{2\\pi}\\int_0^1\\sqrt2 r\\,drd\\theta=\\pi\\sqrt2.$$",
    source
  },
  {
    number: 27,
    categorySlug: "parameter-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите интеграл при $a>0$.",
    expressionLatex: "\\int_0^{\\infty} e^{-ax}\\,dx",
    answerMarkdown: "$\\frac1a$",
    solutionMarkdown: "Для $a>0$:\n\n$$\\int_0^b e^{-ax}dx=\\frac{1-e^{-ab}}{a}.$$\n\nПри $b\\to\\infty$ получаем $\\frac1a$.",
    source
  },
  {
    number: 28,
    categorySlug: "parameter-integrals",
    difficulty: Difficulty.HARD,
    conditionMarkdown: "Вычислите интеграл при $a>-1$.",
    expressionLatex: "\\int_0^1 x^a\\,dx",
    answerMarkdown: "$\\frac{1}{a+1}$",
    solutionMarkdown: "При $a\\ne -1$ первообразная равна $\\frac{x^{a+1}}{a+1}$. Условие $a>-1$ обеспечивает сходимость в нуле.\n\n$$\\int_0^1x^adx=\\frac{1}{a+1}.$$",
    source
  },
  {
    number: 29,
    categorySlug: "other-integrals",
    difficulty: Difficulty.EASY,
    conditionMarkdown: "Вычислите среднее значение функции на отрезке $[0,2]$.",
    expressionLatex: "\\frac{1}{2}\\int_0^2 x\\,dx",
    answerMarkdown: "$1$",
    solutionMarkdown: "$$\\frac12\\int_0^2x\\,dx=\\frac12\\cdot\\frac{x^2}{2}\\bigg|_0^2=\\frac12\\cdot2=1.$$",
    source
  },
  {
    number: 30,
    categorySlug: "other-integrals",
    difficulty: Difficulty.MEDIUM,
    conditionMarkdown: "Вычислите интеграл с заменой $u=1+x^2$.",
    expressionLatex: "\\int_0^1 \\frac{2x}{1+x^2}\\,dx",
    answerMarkdown: "$\\ln 2$",
    solutionMarkdown: "Положим $u=1+x^2$, тогда $du=2x\\,dx$. При $x=0$ имеем $u=1$, при $x=1$ имеем $u=2$.\n\n$$\\int_1^2\\frac{du}{u}=\\ln2.$$",
    source
  }
];

async function main() {
  await prisma.taskImage.deleteMany();
  await prisma.task.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.category.deleteMany();

  const categoryMap = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const created = await prisma.category.create({
      data: {
        name: category[0],
        slug: category[1],
        description: category[2],
        sortOrder: index + 1,
        isActive: true
      }
    });
    categoryMap.set(created.slug, created.id);
  }

  for (const task of tasks) {
    const categoryId = categoryMap.get(task.categorySlug);
    if (!categoryId) throw new Error(`Missing category ${task.categorySlug}`);
    const duplicateHash = computeDuplicateHash({
      categoryId,
      conditionMarkdown: task.conditionMarkdown,
      expressionLatex: task.expressionLatex,
      answerMarkdown: task.answerMarkdown
    });
    const created = await prisma.task.create({
      data: {
        number: task.number,
        categoryId,
        difficulty: task.difficulty,
        conditionMarkdown: task.conditionMarkdown,
        expressionLatex: task.expressionLatex,
        answerMarkdown: task.answerMarkdown,
        solutionMarkdown: task.solutionMarkdown,
        source: task.source,
        status: TaskStatus.PUBLISHED,
        duplicateHash,
        publishedAt: new Date()
      }
    });
    if (task.diagram) {
      const stored = await localStorageService.save(
        Buffer.from(task.diagram.svg, "utf8"),
        `tasks/${created.id}`,
        task.diagram.fileName
      );
      await prisma.taskImage.create({
        data: {
          taskId: created.id,
          originalFileName: task.diagram.fileName,
          storedFileName: stored.storedFileName,
          storagePath: stored.storagePath,
          mimeType: "image/svg+xml",
          sizeBytes: stored.sizeBytes,
          altText: task.diagram.alt,
          sortOrder: 0
        }
      });
    }
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
