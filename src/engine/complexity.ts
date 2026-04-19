// Complexity Theory Knowledge Base

export interface ComplexityProblem {
  name: string
  class: ('P' | 'NP' | 'NP-Complete' | 'NP-Hard')[]
  description: string
  example: string
  reductions: string[] // problems it reduces to
}

export const complexityProblems: ComplexityProblem[] = [
  { name: 'Sorting', class: ['P'], description: 'Arrange elements in order. Solvable in O(n log n).', example: '[5,3,1,4,2] → [1,2,3,4,5]', reductions: [] },
  { name: 'Shortest Path', class: ['P'], description: 'Find the shortest path between two nodes (Dijkstra\'s algorithm).', example: 'A→B with minimum weight', reductions: [] },
  { name: 'Matrix Multiplication', class: ['P'], description: 'Multiply two n×n matrices. O(n³) naive, O(n^2.37) Strassen.', example: 'A × B = C', reductions: [] },
  { name: '2-SAT', class: ['P'], description: 'Boolean satisfiability with at most 2 literals per clause.', example: '(x₁∨x₂)∧(¬x₁∨x₃)', reductions: [] },
  { name: 'Primality Testing', class: ['P'], description: 'Determine if a number is prime. AKS algorithm runs in polynomial time.', example: 'Is 17 prime? → Yes', reductions: [] },
  { name: 'Boolean SAT (SAT)', class: ['NP', 'NP-Complete'], description: 'The first proven NP-Complete problem (Cook\'s Theorem). Given a Boolean formula, is there an assignment that satisfies it?', example: '(x∨y)∧(¬x∨z) satisfiable?', reductions: ['3-SAT', 'Vertex Cover', 'Clique'] },
  { name: '3-SAT', class: ['NP', 'NP-Complete'], description: 'SAT restricted to exactly 3 literals per clause. Still NP-Complete.', example: '(x₁∨x₂∨x₃)∧(¬x₁∨x₂∨¬x₃)', reductions: ['Independent Set', 'Vertex Cover'] },
  { name: 'Vertex Cover', class: ['NP', 'NP-Complete'], description: 'Find minimum set of vertices that covers all edges.', example: 'Cover all edges with ≤k vertices', reductions: ['Independent Set', 'Set Cover'] },
  { name: 'Clique', class: ['NP', 'NP-Complete'], description: 'Find a complete subgraph of size k.', example: 'Does G have a clique of size 4?', reductions: ['Independent Set'] },
  { name: 'Hamiltonian Path', class: ['NP', 'NP-Complete'], description: 'Find a path visiting every vertex exactly once.', example: 'Visit all cities once', reductions: ['TSP'] },
  { name: 'Traveling Salesman (TSP)', class: ['NP', 'NP-Hard'], description: 'Find the shortest tour visiting all cities. Decision version is NP-Complete.', example: 'Minimum cost tour through 5 cities', reductions: [] },
  { name: 'Graph Coloring', class: ['NP', 'NP-Complete'], description: 'Color vertices with k colors so no adjacent vertices share a color.', example: 'Color map with 3 colors', reductions: [] },
  { name: 'Subset Sum', class: ['NP', 'NP-Complete'], description: 'Given a set of integers, is there a subset that sums to a target?', example: '{3,7,1,8,5} sum to 12?', reductions: ['Knapsack'] },
  { name: 'Halting Problem', class: ['NP-Hard'], description: 'Determine if a program halts on given input. Undecidable — not even in NP.', example: 'Does program P halt on input x?', reductions: [] },
  { name: 'Independent Set', class: ['NP', 'NP-Complete'], description: 'Find k vertices with no edges between them.', example: 'Find 3 non-adjacent vertices', reductions: ['Vertex Cover'] },
]

export function searchProblems(query: string): ComplexityProblem[] {
  const q = query.toLowerCase()
  return complexityProblems.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.class.some(c => c.toLowerCase().includes(q))
  )
}
