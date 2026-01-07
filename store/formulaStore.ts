import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Variable {
  symbol: string;
  name: string;
  unit: string;
}

export interface DerivationStep {
  stepNumber: number;
  title: string;
  content: string;
  mathExpression?: string;
  explanation: string;
}

export interface FormulaExample {
  problem: string;
  given: string[];
  solution: string;
  answer: string;
}

export interface Formula {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  formulaName: string;
  formula: string;
  variables: Variable[];
  uses: string;
  hasDerivation: boolean;
  derivation?: DerivationStep[];
  examples?: FormulaExample[];
  diagram?: string;
  relatedFormulas?: string[];
}

interface FormulaState {
  formulas: Formula[];
  favoriteFormulas: string[];
  
  toggleFavorite: (formulaId: string) => void;
  isFavorite: (formulaId: string) => boolean;
  getFormula: (formulaId: string) => Formula | undefined;
  searchFormulas: (query: string) => Formula[];
  getFormulasBySubject: (subject: string) => Formula[];
}

const MOCK_FORMULAS: Formula[] = [
  {
    id: 'f1',
    subject: 'Physics',
    chapter: 'Motion',
    topic: 'Equations of Motion',
    formulaName: "Newton's Second Law",
    formula: 'F = ma',
    variables: [
      { symbol: 'F', name: 'Force', unit: 'N (Newton)' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'a', name: 'Acceleration', unit: 'm/s²' },
    ],
    uses: 'Used to calculate the force acting on an object with a given mass and acceleration.',
    hasDerivation: true,
    derivation: [
      {
        stepNumber: 1,
        title: 'Initial Law',
        content: "Newton's second law states that the rate of change of momentum of an object is proportional to the applied force in the direction of the force.",
        mathExpression: 'F \\propto \\frac{dp}{dt}',
        explanation: 'Where p is momentum.',
      },
      {
        stepNumber: 2,
        title: 'Momentum Definition',
        content: 'Momentum is the product of mass and velocity.',
        mathExpression: 'p = mv',
        explanation: 'm is mass and v is velocity.',
      },
      {
        stepNumber: 3,
        title: 'Substitution',
        content: 'Substitute p = mv into the force equation.',
        mathExpression: 'F = k \\frac{d(mv)}{dt}',
        explanation: 'k is a proportionality constant (k=1 in SI units).',
      },
      {
        stepNumber: 4,
        title: 'Constant Mass',
        content: 'If mass is constant, it can be taken out of the derivative.',
        mathExpression: 'F = m \\frac{dv}{dt}',
        explanation: 'dv/dt is the rate of change of velocity.',
      },
      {
        stepNumber: 5,
        title: 'Acceleration',
        content: 'The rate of change of velocity is acceleration.',
        mathExpression: 'a = \\frac{dv}{dt}',
        explanation: 'So, F = ma.',
      },
    ],
    examples: [
      {
        problem: 'A car of mass 1000 kg is accelerating at 2 m/s². Calculate the force acting on it.',
        given: ['m = 1000 kg', 'a = 2 m/s²'],
        solution: 'Using F = ma, F = 1000 * 2 = 2000 N.',
        answer: '2000 N',
      },
    ],
    relatedFormulas: ['f2'],
  },
  {
    id: 'f2',
    subject: 'Physics',
    chapter: 'Energy',
    topic: 'Kinetic Energy',
    formulaName: 'Kinetic Energy',
    formula: 'KE = \\frac{1}{2}mv^2',
    variables: [
      { symbol: 'KE', name: 'Kinetic Energy', unit: 'J (Joule)' },
      { symbol: 'm', name: 'Mass', unit: 'kg' },
      { symbol: 'v', name: 'Velocity', unit: 'm/s' },
    ],
    uses: 'Used to calculate the energy of an object due to its motion.',
    hasDerivation: false,
    examples: [
      {
        problem: 'Calculate the kinetic energy of a 2 kg ball moving at 5 m/s.',
        given: ['m = 2 kg', 'v = 5 m/s'],
        solution: 'KE = 1/2 * 2 * 5^2 = 25 J.',
        answer: '25 J',
      },
    ],
  },
  {
    id: 'f3',
    subject: 'Math',
    chapter: 'Trigonometry',
    topic: 'Identities',
    formulaName: 'Pythagorean Identity',
    formula: '\\sin^2\\theta + \\cos^2\\theta = 1',
    variables: [
      { symbol: '\\theta', name: 'Angle', unit: 'degrees/radians' },
    ],
    uses: 'Fundamental identity in trigonometry relating sine and cosine of an angle.',
    hasDerivation: true,
    derivation: [
      {
        stepNumber: 1,
        title: 'Right Triangle',
        content: 'Consider a right triangle with hypotenuse r, and sides x and y.',
        mathExpression: 'x^2 + y^2 = r^2',
        explanation: 'By Pythagorean theorem.',
      },
      {
        stepNumber: 2,
        title: 'Divide by r²',
        content: 'Divide both sides by r².',
        mathExpression: '\\frac{x^2}{r^2} + \\frac{y^2}{r^2} = 1',
        explanation: 'Normalization.',
      },
      {
        stepNumber: 3,
        title: 'Trig Definitions',
        content: 'Substitute sinθ = y/r and cosθ = x/r.',
        mathExpression: '\\sin^2\\theta + \\cos^2\\theta = 1',
        explanation: 'Final identity.',
      },
    ],
  },
  {
    id: 'f4',
    subject: 'Biology',
    chapter: 'Genetics',
    topic: 'Population Genetics',
    formulaName: 'Hardy-Weinberg Equilibrium',
    formula: 'p^2 + 2pq + q^2 = 1',
    variables: [
      { symbol: 'p', name: 'Frequency of dominant allele', unit: 'ratio' },
      { symbol: 'q', name: 'Frequency of recessive allele', unit: 'ratio' },
    ],
    uses: 'Used to calculate allele and genotype frequencies in a population.',
    hasDerivation: false,
    examples: [
      {
        problem: 'In a population, the frequency of the recessive allele is 0.3. Calculate the frequency of heterozygotes.',
        given: ['q = 0.3'],
        solution: 'p = 1 - q = 0.7. Frequency of heterozygotes = 2pq = 2 * 0.7 * 0.3 = 0.42.',
        answer: '0.42',
      },
    ],
  },
];

export const useFormulaStore = create<FormulaState>()(
  persist(
    (set, get) => ({
      formulas: MOCK_FORMULAS,
      favoriteFormulas: [],
      
      toggleFavorite: (formulaId) => set((state) => ({
        favoriteFormulas: state.favoriteFormulas.includes(formulaId)
          ? state.favoriteFormulas.filter(id => id !== formulaId)
          : [...state.favoriteFormulas, formulaId],
      })),
      
      isFavorite: (formulaId) => get().favoriteFormulas.includes(formulaId),
      
      getFormula: (formulaId) => get().formulas.find(f => f.id === formulaId),
      
      searchFormulas: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().formulas.filter(f => 
          f.formulaName.toLowerCase().includes(lowerQuery) ||
          f.subject.toLowerCase().includes(lowerQuery) ||
          f.topic.toLowerCase().includes(lowerQuery) ||
          f.chapter.toLowerCase().includes(lowerQuery)
        );
      },
      
      getFormulasBySubject: (subject) => {
        return get().formulas.filter(f => f.subject.toLowerCase() === subject.toLowerCase());
      },
    }),
    {
      name: 'learnsmart-formulas',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
