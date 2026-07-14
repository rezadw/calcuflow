export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface SubChapter {
  id: string;
  title: string;
  concept: string;
  formula: string;
  workedExample: string[];
  quiz: QuizQuestion[];
}

export interface Chapter {
  id: string;
  title: string;
  subChapters: SubChapter[];
}

export const mockModuleData: Chapter[] = [
  {
    id: "chap-1",
    title: "BAB 1: Limit Fungsi",
    subChapters: [
      {
        id: "sub-1-1",
        title: "Konsep Dasar Limit",
        concept: "Limit merupakan sebuah konsep dalam matematika yang digunakan untuk menjelaskan sifat dari suatu fungsi saat argumennya mendekati suatu titik tertentu. Limit sering digunakan dalam kalkulus (dan cabang lainnya dari analisis matematika) untuk mencari turunan dan kekontinuan.",
        formula: "\\lim_{x \\to a} f(x) = L",
        workedExample: [
          "Tentukan nilai x ketika x mendekati 2 untuk fungsi f(x) = 2x.",
          "Substitusikan nilai x = 2 ke dalam fungsi.",
          "f(2) = 2(2) = 4.",
          "Jadi, lim_{x -> 2} 2x = 4."
        ],
        quiz: [
          {
            id: "q-1",
            question: "Berapakah hasil dari lim x->3 (x + 2)?",
            options: ["3", "4", "5", "6"],
            correctAnswer: "5"
          },
          {
            id: "q-2",
            question: "Berapakah hasil dari lim x->0 (2x)?",
            options: ["0", "1", "2", "Tak hingga"],
            correctAnswer: "0"
          },
          {
            id: "q-3",
            question: "Apakah konsep limit membutuhkan fungsi yang terdefinisi pada titik tersebut?",
            options: ["Ya, mutlak", "Tidak harus", "Tergantung jenis fungsi", "Semua salah"],
            correctAnswer: "Tidak harus"
          }
        ]
      },
      {
        id: "sub-1-2",
        title: "Limit Fungsi Aljabar",
        concept: "Limit fungsi aljabar dapat diselesaikan dengan cara substitusi langsung, pemfaktoran, atau mengalikan dengan bentuk sekawan (jika berbentuk akar). Jika substitusi langsung menghasilkan bentuk tak tentu 0/0, maka harus difaktorkan terlebih dahulu.",
        formula: "\\lim_{x \\to a} \\frac{x^2 - a^2}{x - a} = \\lim_{x \\to a} \\frac{(x - a)(x + a)}{x - a} = 2a",
        workedExample: [
          "Tentukan nilai lim x->2 (x^2 - 4) / (x - 2).",
          "Jika disubstitusi langsung, hasilnya 0/0 (bentuk tak tentu).",
          "Faktorkan pembilang: x^2 - 4 = (x - 2)(x + 2).",
          "Coret (x - 2) pada pembilang dan penyebut.",
          "Substitusi x = 2 ke sisa fungsi (x + 2). Hasilnya 2 + 2 = 4."
        ],
        quiz: [
          {
            id: "q-4",
            question: "Berapakah hasil dari lim x->3 (x^2 - 9) / (x - 3)?",
            options: ["0", "3", "6", "9"],
            correctAnswer: "6"
          },
          {
            id: "q-5",
            question: "Jika substitusi langsung menghasilkan 0/0, apa langkah yang tepat?",
            options: ["Pemfaktoran", "Hasilnya 0", "Hasilnya Tak Hingga", "Menambah x"],
            correctAnswer: "Pemfaktoran"
          },
          {
            id: "q-6",
            question: "Hasil dari lim x->1 (x-1)/(x-1) adalah?",
            options: ["0", "1", "Tak Hingga", "2"],
            correctAnswer: "1"
          }
        ]
      }
    ]
  },
  {
    id: "chap-2",
    title: "BAB 2: Turunan",
    subChapters: [
      {
        id: "sub-2-1",
        title: "Definisi Turunan",
        concept: "Turunan mengukur bagaimana laju perubahan suatu fungsi seiring dengan perubahan variabel inputnya. Secara geometris, turunan pada suatu titik adalah kemiringan (gradien) garis singgung kurva fungsi di titik tersebut.",
        formula: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}",
        workedExample: [
          "Tentukan turunan pertama f(x) = x^2.",
          "Gunakan limit definisi turunan: f(x+h) = (x+h)^2 = x^2 + 2xh + h^2.",
          "f(x+h) - f(x) = 2xh + h^2.",
          "Bagi dengan h dan ambil limit h->0: lim h->0 (2x + h) = 2x."
        ],
        quiz: [
          {
            id: "q-7",
            question: "Turunan fungsi f(x) = x^2 adalah?",
            options: ["x", "2x", "x^3", "2x^2"],
            correctAnswer: "2x"
          },
          {
            id: "q-8",
            question: "Makna geometris turunan di suatu titik adalah?",
            options: ["Luas area", "Kemiringan garis singgung", "Titik potong sumbu", "Titik puncak"],
            correctAnswer: "Kemiringan garis singgung"
          },
          {
            id: "q-9",
            question: "Berapakah turunan dari f(x) = 5x?",
            options: ["0", "1", "5", "x"],
            correctAnswer: "5"
          }
        ]
      }
    ]
  }
];
