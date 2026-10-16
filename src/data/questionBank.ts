import { QuestionItem } from '../types/economics';

export const QUESTION_BANK: QuestionItem[] = [
  {
    id: 'q1-quota-decrease',
    title: 'Quota Reduction on Imported Farm Products',
    sourceType: 'Source Question (Notes)',
    officialRef: 'Guided Example 16.3 / HKDSE 2015 Paper 2 Q3',
    marks: 6,
    category: 'change_intervention',
    intervention: 'quota',
    prompt:
      'To protect its declining local agricultural industry, the government reduces an effective import quota on farm products. With the aid of a diagram, explain the effect of such quota reduction on efficiency in the market of imported farm products. (6 marks)',
    diagramPreset: {
      intervention: 'quota',
      params: { quotaQty: 30 },
      showShift: true,
      shiftType: 'left_supply',
      labelAnnotations: {
        P1: 'Original price',
        P2: 'New price after quota cut',
        Q1: 'Original quota quantity',
        Q2: 'New quota quantity',
        'Q*': 'Efficient output',
      },
    },
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Step 1: Explain the change in supply',
        purpose: 'Identify the directional shift of the quota-constrained supply curve',
        sentencePrefix: 'A decrease in the import quota will lead to a ',
        blanks: [
          {
            id: 'b1_1',
            placeholder: 'select direction...',
            correctAnswer: 'decrease',
            options: ['decrease', 'increase', 'no change'],
            misconceptionHints: {
              increase: 'A quota restricts the maximum quantity allowed into the market. Lowering this maximum ceiling restricts supply, shifting the vertical/kinked supply curve leftward.',
              'no change': 'An effective quota directly sets the upper limit on quantity supplied. Changing the quota shifts the supply curve.'
            }
          }
        ],
        sentenceSuffix: ' in supply.',
        explanationOnCorrect: 'Correct! Reducing the import quota shifts the supply curve to the left (Sq1 to Sq2).'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Step 2: State the change in price and quantity transacted',
        purpose: 'Determine the new market equilibrium price and quantity transacted',
        sentencePrefix: 'This will lead to an ',
        blanks: [
          {
            id: 'b2_1',
            placeholder: 'price change...',
            correctAnswer: 'increase',
            options: ['increase', 'decrease', 'uncertain change'],
            misconceptionHints: {
              decrease: 'When supply decreases along a downward-sloping demand curve, buyers must bid a higher price for the scarcer goods.',
              'uncertain change': 'With supply shifting left along an unchanged demand curve, the price change is definitely an increase.'
            }
          }
        ],
        sentenceMidfix: [' in price and a '],
        blanksMid: [
          {
            id: 'b2_2',
            placeholder: 'quantity change...',
            correctAnswer: 'decrease',
            options: ['decrease', 'increase', 'no change'],
            misconceptionHints: {
              increase: 'Since the quota limit was reduced, the maximum allowed quantity transacted must fall.',
              'no change': 'An effective quota binds the transacted quantity, so lowering the quota forces quantity transacted to fall.'
            }
          }
        ] as any,
        sentenceSuffix: ' in quantity transacted.',
        explanationOnCorrect: 'Correct! Price rises from P1 to P2 and quantity transacted falls from Q1 to Q2.'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Step 3: Compare MB and MC & Deadweight Loss',
        purpose: 'Relate the new quantity transacted to efficient output and explain the gap between MB and MC',
        sentencePrefix: 'As quantity transacted decreases ',
        blanks: [
          {
            id: 'b3_1',
            placeholder: 'relative to efficient output...',
            correctAnswer: 'away from',
            options: ['away from', 'towards'],
            misconceptionHints: {
              towards: 'Since the market was already underproducing (Q1 < Q*), reducing output further to Q2 moves it further away from the efficient output Q*.'
            }
          },
          {
            id: 'b3_2',
            placeholder: 'gap change...',
            correctAnswer: 'increase',
            options: ['increase', 'decrease', 'remain constant'],
            misconceptionHints: {
              decrease: 'Because demand slopes down and supply slopes up, as Q decreases, MB rises and MC falls, widening the gap (MB - MC).',
              'remain constant': 'The gap between MB and MC changes as output changes along the curves.'
            }
          },
          {
            id: 'b3_3',
            placeholder: 'DWL size...',
            correctAnswer: 'larger',
            options: ['larger', 'smaller', 'constant'],
            misconceptionHints: {
              smaller: 'A wider divergence between MB and MC over a larger span of unproduced units generates a larger deadweight loss area.'
            }
          }
        ],
        sentenceMidfix: [
          ' the efficient output, the difference between marginal benefit and marginal cost will ',
          ', resulting in a '
        ],
        sentenceSuffix: ' deadweight loss.',
        explanationOnCorrect: 'Correct! At Q2, MB exceeds MC by a greater margin, expanding the deadweight loss triangle.'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: 'Step 4: State the conclusion on economic efficiency',
        purpose: 'Conclude the ultimate effect on market efficiency',
        sentencePrefix: 'Hence, market efficiency will ',
        blanks: [
          {
            id: 'b4_1',
            placeholder: 'efficiency outcome...',
            correctAnswer: 'worsen',
            options: ['worsen', 'improve', 'remain unchanged'],
            misconceptionHints: {
              improve: 'When deadweight loss increases (loss of total social surplus expands), market efficiency worsens.',
              'remain unchanged': 'Any change in deadweight loss directly alters economic efficiency.'
            }
          }
        ],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! An increase in deadweight loss means economic efficiency has worsened.'
      }
    ],
    modelAnswer:
      'A decrease in the quota will lead to a decrease in supply. This will lead to an increase in price and a decrease in quantity transacted. As quantity transacted decreases away from the efficient output, the difference between marginal benefit and marginal cost will increase, resulting in a larger deadweight loss. Hence, market efficiency will worsen.',
    markingRubric: [
      { point: 'Correctly illustrated supply-demand diagram with leftward shift of quota supply and indicated increase in DWL', marks: 3 },
      { point: 'Explain the decrease in supply', marks: 1 },
      { point: 'State the increase in price and decrease in quantity transacted', marks: 1 },
      { point: 'Explain the change in efficiency by stating the increase in the difference between MB and MC / increase in DWL', marks: 1 },
    ],
    diagramChecklist: [
      'Original curves D (MB), S (MC), and quota supply Sq1',
      'Leftward shifted quota supply Sq2',
      'Price increases from P1 to P2, Quantity falls from Q1 to Q2',
      'Shaded increase in deadweight loss between Q2 and Q1 under MB and MC'
    ],
    commonMistakes: [
      'Confusing quota (quantity control) with a price floor',
      'Forgetting to mention the gap between marginal benefit (MB) and marginal cost (MC)',
      'Stating efficiency improves because domestic farmers gain, forgetting that efficiency evaluates total social surplus'
    ]
  },
  {
    id: 'q2-price-floor-lower',
    title: 'Lowering an Effective Price Floor to Ineffective',
    sourceType: 'Source Question (Notes)',
    officialRef: 'Guided Example 16.1 / HKDSE 2014 Paper 2 Q3',
    marks: 6,
    category: 'change_intervention',
    intervention: 'floor',
    prompt:
      'Refer to the supply-demand diagram of a good. Suppose the government lowers the price floor of a good from P1 to P2 (where P1 is above equilibrium and P2 is below equilibrium). With the aid of the diagram, explain how economic efficiency is affected. (6 marks)',
    diagramPreset: {
      intervention: 'floor',
      params: { floorPrice: 65 },
      showShift: true,
      shiftType: 'floor_down',
      labelAnnotations: {
        P1: 'Effective floor (above Pe)',
        P2: 'Ineffective floor (below Pe)',
        Pe: 'Equilibrium price',
        Q1: 'Original transacted quantity',
        Qe: 'Efficient output (Q*)',
      },
    },
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Step 1: Explain the original market outcome under P1',
        purpose: 'Analyse why the original effective price floor was inefficient',
        sentencePrefix: 'As the original price floor (P1) is effective, the price is P1 and quantity transacted is Q1 where marginal benefit is ',
        blanks: [
          {
            id: 'b1_1',
            placeholder: 'MB vs MC relation...',
            correctAnswer: 'higher than',
            options: ['higher than', 'lower than', 'equal to'],
            misconceptionHints: {
              'lower than': 'At Q1 (determined by demand at P1), consumers value the marginal unit at P1, which is far higher than the marginal cost on the supply curve.',
              'equal to': 'If MB = MC the market would be efficient, but an effective price floor creates underproduction.'
            }
          }
        ],
        sentenceMidfix: [' marginal cost, resulting in underproduction and a '],
        blanksMid: [
          {
            id: 'b1_2',
            placeholder: 'efficiency outcome...',
            correctAnswer: 'deadweight loss',
            options: ['deadweight loss', 'consumer surplus gain', 'subsidy expenditure'],
            misconceptionHints: {
              'consumer surplus gain': 'Consumers suffer a loss of surplus because price is higher and quantity transacted is lower.',
              'subsidy expenditure': 'A price floor is a regulatory price control, not a government subsidy.'
            }
          }
        ] as any,
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! At Q1, MB > MC, so there is underproduction and a deadweight loss.'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Step 2: Explain the new market outcome under P2',
        purpose: 'Determine the effectiveness of the new floor and the adjustment to equilibrium',
        sentencePrefix: 'As the new price floor (P2) is ineffective, price ',
        blanks: [
          {
            id: 'b2_1',
            placeholder: 'price direction...',
            correctAnswer: 'decreases',
            options: ['decreases', 'increases', 'stays at P2'],
            misconceptionHints: {
              'stays at P2': 'A price floor set below equilibrium is non-binding (ineffective); market forces push the price to the market equilibrium Pe.',
              increases: 'The price drops from the high mandated level P1 down to the equilibrium price Pe.'
            }
          },
          {
            id: 'b2_2',
            placeholder: 'quantity direction...',
            correctAnswer: 'increases',
            options: ['increases', 'decreases', 'remains unchanged'],
            misconceptionHints: {
              decreases: 'Because the price falls to Pe, consumers expand their quantity demanded from Q1 to Qe.',
              'remains unchanged': 'The transacted quantity expands to equilibrium Qe.'
            }
          }
        ],
        sentenceMidfix: [
          ' to Pe and quantity transacted '
        ],
        sentenceSuffix: ' to the equilibrium quantity Qe.',
        explanationOnCorrect: 'Correct! Because P2 is below Pe, it is ineffective, allowing the price to fall to Pe and output to rise to Qe.'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Step 3: State the efficiency at the new equilibrium',
        purpose: 'Evaluate the marginal condition at equilibrium quantity Qe',
        sentencePrefix: 'At the equilibrium quantity (Qe), the market is efficient as marginal benefit is ',
        blanks: [
          {
            id: 'b3_1',
            placeholder: 'MB and MC relationship...',
            correctAnswer: 'equal to',
            options: ['equal to', 'higher than', 'lower than'],
            misconceptionHints: {
              'higher than': 'At equilibrium without intervention, demand intersects supply, so MB exactly equals MC.',
              'lower than': 'MB < MC only happens during overproduction.'
            }
          }
        ],
        sentenceSuffix: ' marginal cost.',
        explanationOnCorrect: 'Correct! At competitive equilibrium Qe, MB = MC = Pe, achieving allocative efficiency.'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: 'Step 4: Conclude the effect on deadweight loss and efficiency',
        purpose: 'State the final conclusion on efficiency improvement',
        sentencePrefix: 'Hence, the deadweight loss is ',
        blanks: [
          {
            id: 'b4_1',
            placeholder: 'DWL outcome...',
            correctAnswer: 'eliminated',
            options: ['eliminated', 'increased', 'unchanged'],
            misconceptionHints: {
              increased: 'Since output returns to efficient output Q*, deadweight loss vanishes completely.'
            }
          },
          {
            id: 'b4_2',
            placeholder: 'efficiency outcome...',
            correctAnswer: 'improves',
            options: ['improves', 'worsens', 'remains unchanged'],
            misconceptionHints: {
              worsens: 'Removing deadweight loss maximises total social surplus, meaning economic efficiency improves.'
            }
          }
        ],
        sentenceMidfix: [' and economic efficiency '],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! Deadweight loss is completely eliminated and economic efficiency improves.'
      }
    ],
    modelAnswer:
      'As the original price floor (P1) is effective, the price is P1 and quantity transacted is Q1. At the quantity transacted (Q1), the market is inefficient as marginal benefit is higher than marginal cost and there is a deadweight loss. As the new price floor (P2) is ineffective, price decreases to Pe and quantity transacted increases to Qe. At the equilibrium quantity (Qe), the market is efficient as marginal benefit is equal to marginal cost. Hence, the deadweight loss is eliminated and economic efficiency improves.',
    markingRubric: [
      { point: 'Illustrate in supply-demand diagram: original effective floor P1, ineffective floor P2, and deadweight loss eliminated', marks: 2 },
      { point: 'Explain that original floor P1 is effective with price P1 and quantity Q1', marks: 1 },
      { point: 'Explain that at Q1, market is inefficient as MB > MC with a deadweight loss', marks: 1 },
      { point: 'Explain that new floor P2 is ineffective, so price falls to Pe and quantity rises to Qe', marks: 1 },
      { point: 'Explain that at Qe, MB = MC, deadweight loss is eliminated and efficiency improves', marks: 1 },
    ],
    diagramChecklist: [
      'Demand curve D = MB and Supply curve S = MC',
      'High price floor line P1 > Pe and transacted quantity Q1',
      'Low price floor line P2 < Pe labeled as ineffective',
      'Arrows showing price moving to Pe and quantity moving to Qe',
      'Shaded deadweight loss eliminated'
    ],
    commonMistakes: [
      'Confusing effectiveness of price control with efficiency: effectiveness means whether the control binds, efficiency means MB = MC',
      'Assuming P2 sets the new market price: when a floor is below equilibrium, the market price is Pe, not P2'
    ]
  },
  {
    id: 'q3-unit-tax-cosmetics',
    title: 'Imposing a Unit Tax on Cosmetics',
    sourceType: 'Source Question (Notes)',
    officialRef: 'Guided Example 16.4 / HKDSE 2017 Paper 2 Q11b',
    marks: 5,
    category: 'introduce_intervention',
    intervention: 'tax',
    prompt:
      'Suppose the government imposes a unit tax on sales of cosmetics products. With the aid of a diagram, explain how such policy may lead to economic inefficiency. (5 marks)',
    diagramPreset: {
      intervention: 'tax',
      params: { taxRate: 20 },
      showShift: true,
      shiftType: 'tax_up',
      labelAnnotations: {
        S0: 'Original supply (MC)',
        S1: 'Supply with tax (MC + t)',
        P1: 'Price paid by consumers',
        P2: 'Net price received by sellers',
        Q1: 'New quantity transacted',
        'Q*': 'Efficient output',
      },
    },
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Step 1: Explain the change in supply and quantity transacted',
        purpose: 'Show how the per-unit tax shifts the supply curve and reduces transacted quantity',
        sentencePrefix: 'After imposing the unit tax, the supply curve will shift ',
        blanks: [
          {
            id: 'b1_1',
            placeholder: 'shift direction...',
            correctAnswer: 'upwards',
            options: ['upwards', 'downwards', 'to the right'],
            misconceptionHints: {
              downwards: 'A tax increases production costs per unit for sellers, shifting the supply curve vertically upwards by the tax amount $t.',
              'to the right': 'A rightward shift represents an increase in supply, which happens under a subsidy, not a tax.'
            }
          },
          {
            id: 'b1_2',
            placeholder: 'quantity direction...',
            correctAnswer: 'decrease',
            options: ['decrease', 'increase', 'remain unchanged'],
            misconceptionHints: {
              increase: 'Because the price paid by consumers rises, quantity demanded falls along the demand curve.'
            }
          }
        ],
        sentenceMidfix: [' by the amount of tax ($t) and quantity transacted will '],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! The supply curve shifts upward to S1 = MC + t, and quantity transacted falls to Q1.'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Step 2: Compare Marginal Benefit and Marginal Cost',
        purpose: 'Emphasise that the social MC curve remains the original S0 curve',
        sentencePrefix: 'From the viewpoint of society, the cost of producing the good is not affected by the tax, so at the new quantity transacted (Q1), the marginal benefit is ',
        blanks: [
          {
            id: 'b2_1',
            placeholder: 'compare MB and MC...',
            correctAnswer: 'higher than',
            options: ['higher than', 'lower than', 'equal to'],
            misconceptionHints: {
              'lower than': 'At Q1 < Q*, the demand curve (MB) is above the original social supply curve S0 (MC).',
              'equal to': 'Consumers pay P1 (MB) while producers receive P2 (MC), so MB exceeds MC by the amount of tax t.'
            }
          }
        ],
        sentenceSuffix: ' the marginal cost (without tax).',
        explanationOnCorrect: 'Correct! The tax drives a wedge: MB = P1 > MC = P2, meaning society values additional units more than their cost of production.'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Step 3: State the efficiency conclusion and deadweight loss',
        purpose: 'Conclude why underproduction causes inefficiency',
        sentencePrefix: 'There is ',
        blanks: [
          {
            id: 'b3_1',
            placeholder: 'production status...',
            correctAnswer: 'underproduction',
            options: ['underproduction', 'overproduction'],
            misconceptionHints: {
              overproduction: 'Because transacted quantity Q1 is less than efficient output Q*, output is underproduced.'
            }
          },
          {
            id: 'b3_2',
            placeholder: 'efficiency status...',
            correctAnswer: 'inefficient',
            options: ['inefficient', 'efficient'],
            misconceptionHints: {
              efficient: 'A market with deadweight loss is allocatively inefficient.'
            }
          }
        ],
        sentenceMidfix: [' because Q1 is smaller than the efficient output Q*, resulting in a deadweight loss. Hence, the market becomes '],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! Underproduction creates a deadweight loss, causing economic inefficiency.'
      }
    ],
    modelAnswer:
      'After imposing the unit tax, the supply curve will shift upwards and quantity transacted will decrease. At the new quantity transacted (Q1), the marginal benefit is higher than the marginal cost (as social MC is still the original supply curve S0), resulting in underproduction and a deadweight loss. Hence, the market becomes inefficient.',
    markingRubric: [
      { point: 'Illustrate with a supply-demand diagram: upward shift of supply S1 = MC + t, Q1, P1, P2, and shaded DWL', marks: 3 },
      { point: 'Explain the upward shift in supply and decrease in quantity transacted', marks: 1 },
      { point: 'Explain that at Q1, MB > MC resulting in underproduction, deadweight loss, and inefficiency', marks: 1 },
    ],
    diagramChecklist: [
      'Original curves D = MB and S0 = MC',
      'Shifted supply curve S1 = MC + t (parallel upward shift)',
      'Label consumer price P1 and seller net price P2',
      'Label transacted quantity Q1 and efficient quantity Q*',
      'Shaded triangular deadweight loss between Q1 and Q*'
    ],
    commonMistakes: [
      'Assuming the social MC curve shifted upward: from society’s perspective, input costs are unchanged, so MC is still S0',
      'Forgetting that government tax revenue is part of total social surplus (TSS = CS + PS + Tax Revenue)',
      'Confusing underproduction with overproduction'
    ]
  },
  {
    id: 'q4-remove-subsidy',
    title: 'Removing a Unit Subsidy on Electricity / Power Plants',
    sourceType: 'Source Question (Notes)',
    officialRef: 'Guided Example 16.4 Demonstration',
    marks: 6,
    category: 'tax_subsidy_change',
    intervention: 'subsidy',
    prompt:
      'Suppose the government of an economy removed the unit subsidy provided to power plants. With the aid of a diagram, explain how this will affect market efficiency. (6 marks)',
    diagramPreset: {
      intervention: 'subsidy',
      params: { subsidyRate: 20 },
      showShift: true,
      shiftType: 'subsidy_down',
      labelAnnotations: {
        S0: 'Original MC (without subsidy)',
        S1: 'Supply with subsidy (MC - s)',
        Q1: 'Original quantity with subsidy',
        'Q*': 'Efficient output without subsidy',
        P1: 'Original consumer price',
        Pe: 'New market price',
      },
    },
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Step 1: Explain the initial inefficient state under the subsidy',
        purpose: 'Show that the market originally suffered from overproduction where MC > MB',
        sentencePrefix: 'With the original unit subsidy, the quantity transacted (Q1) was greater than the efficient output Q*, where marginal cost was ',
        blanks: [
          {
            id: 'b1_1',
            placeholder: 'MC vs MB under subsidy...',
            correctAnswer: 'higher than',
            options: ['higher than', 'lower than', 'equal to'],
            misconceptionHints: {
              'lower than': 'Under a subsidy, output expands beyond Q*. For units beyond Q*, the supply curve (MC) lies above the demand curve (MB).',
              'equal to': 'If MC = MB there would be no deadweight loss.'
            }
          }
        ],
        sentenceMidfix: [' marginal benefit, resulting in '],
        blanksMid: [
          {
            id: 'b1_2',
            placeholder: 'production state...',
            correctAnswer: 'overproduction',
            options: ['overproduction', 'underproduction'],
            misconceptionHints: {
              underproduction: 'Subsidies artificially encourage extra output beyond Q*, causing overproduction.'
            }
          }
        ] as any,
        sentenceSuffix: ' and a deadweight loss.',
        explanationOnCorrect: 'Correct! Under the subsidy, Q1 > Q* with MC > MB, creating overproduction and deadweight loss.'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Step 2: Explain the shift upon removing the subsidy',
        purpose: 'Explain how the supply curve shifts back when the subsidy is removed',
        sentencePrefix: 'When the unit subsidy is removed, the supply curve shifts ',
        blanks: [
          {
            id: 'b2_1',
            placeholder: 'shift direction...',
            correctAnswer: 'upwards',
            options: ['upwards', 'downwards', 'to the right'],
            misconceptionHints: {
              downwards: 'The subsidy originally shifted supply downward. Removing it raises effective producer costs, shifting supply back upwards to S0 = MC.'
            }
          }
        ],
        sentenceMidfix: [' back to the original supply curve S0, so price paid by consumers '],
        blanksMid: [
          {
            id: 'b2_2',
            placeholder: 'consumer price...',
            correctAnswer: 'increases',
            options: ['increases', 'decreases', 'remains unchanged'],
            misconceptionHints: {
              decreases: 'Without the government paying part of the cost, consumers now pay the full equilibrium price Pe, which is higher than subsidized P1.'
            }
          },
          {
            id: 'b2_3',
            placeholder: 'quantity direction...',
            correctAnswer: 'decreases',
            options: ['decreases', 'increases', 'remains unchanged'],
            misconceptionHints: {
              increases: 'Higher prices lead consumers to reduce quantity demanded back to Qe.'
            }
          }
        ] as any,
        sentenceSuffix: ' and quantity transacted decreases to the efficient output (Q*).',
        explanationOnCorrect: 'Correct! Supply shifts upward to S0, consumer price rises to Pe, and quantity transacted decreases to Q*.'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Step 3: State the efficiency conclusion',
        purpose: 'Conclude the elimination of DWL and improvement of efficiency',
        sentencePrefix: 'At the new quantity transacted (Q*), marginal benefit is equal to marginal cost, so the deadweight loss is ',
        blanks: [
          {
            id: 'b3_1',
            placeholder: 'DWL outcome...',
            correctAnswer: 'eliminated',
            options: ['eliminated', 'expanded', 'doubled'],
            misconceptionHints: {
              expanded: 'When production returns to Q* where MB = MC, deadweight loss becomes zero.'
            }
          },
          {
            id: 'b3_2',
            placeholder: 'efficiency outcome...',
            correctAnswer: 'improves',
            options: ['improves', 'worsens', 'remains unchanged'],
            misconceptionHints: {
              worsens: 'Eliminating deadweight loss maximises total social surplus, improving efficiency.'
            }
          }
        ],
        sentenceMidfix: [' and market efficiency '],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! Deadweight loss is eliminated and market efficiency improves!'
      }
    ],
    modelAnswer:
      'With the original unit subsidy, quantity transacted was Q1 where marginal cost was higher than marginal benefit, resulting in overproduction and a deadweight loss. When the unit subsidy is removed, the supply curve shifts upwards back to S0, price increases and quantity transacted decreases to the efficient output Q*. At Q*, marginal benefit equals marginal cost, so the deadweight loss is eliminated and economic efficiency improves.',
    markingRubric: [
      { point: 'Illustrate in supply-demand diagram: supply curve shifting up from S1 to S0, output falling from Q1 to Q*, and deadweight loss eliminated', marks: 2 },
      { point: 'Explain that the market was originally inefficient with overproduction (MC > MB)', marks: 1 },
      { point: 'Explain the upward shift of supply, price increase, and quantity decrease to Q*', marks: 1 },
      { point: 'Explain that at Q*, MB = MC, deadweight loss is eliminated, and efficiency improves', marks: 2 },
    ],
    diagramChecklist: [
      'Original social curves D = MB and S0 = MC',
      'Subsidized supply curve S1 = MC - s',
      'Output contracting from Q1 back to Q*',
      'Indicator showing deadweight loss eliminated'
    ],
    commonMistakes: [
      'Thinking subsidies always improve efficiency because output increases: actually competitive markets are already efficient, so a subsidy causes overproduction',
      'Forgetting that removing an intervention restores allocative efficiency'
    ]
  },
  {
    id: 'q5-lower-price-ceiling',
    title: 'Lowering an Existing Price Ceiling from Pa to Pb',
    sourceType: 'Source Question (Notes)',
    officialRef: 'Guided Example 16.1 Demonstration',
    marks: 6,
    category: 'change_intervention',
    intervention: 'ceiling',
    prompt:
      'Refer to the supply-demand diagram. Suppose the government lowers the price ceiling of a good from Pa to Pb (both below equilibrium). With the aid of the diagram, explain how economic efficiency is affected. (6 marks)',
    diagramPreset: {
      intervention: 'ceiling',
      params: { ceilingPrice: 35 },
      showShift: true,
      labelAnnotations: {
        Pa: 'Original ceiling price',
        Pb: 'New lowered ceiling price',
        Qa: 'Original transacted quantity',
        Qb: 'New transacted quantity',
        'Q*': 'Efficient output',
      },
    },
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Step 1: State the change in ceiling price and quantity transacted',
        purpose: 'Analyse how tightening the price ceiling affects the transacted quantity along the supply curve',
        sentencePrefix: 'As the price ceiling is lowered from Pa to Pb, the ceiling price decreases and quantity transacted ',
        blanks: [
          {
            id: 'b1_1',
            placeholder: 'quantity direction...',
            correctAnswer: 'decreases',
            options: ['decreases', 'increases', 'remains unchanged'],
            misconceptionHints: {
              increases: 'Although quantity demanded rises, sellers are only willing to supply less at the lower price Pb. In a shortage, transacted quantity is determined by the short side (quantity supplied).'
            }
          }
        ],
        sentenceSuffix: ' from Qa to Qb.',
        explanationOnCorrect: 'Correct! At a lower price Pb, producers reduce quantity supplied from Qa to Qb, so quantity transacted falls.'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Step 2: Relate transacted quantity to the efficient output',
        purpose: 'Explain whether output moves closer to or further away from Q*',
        sentencePrefix: 'At the new quantity transacted (Qb), quantity transacted decreases ',
        blanks: [
          {
            id: 'b2_1',
            placeholder: 'relation to Q*...',
            correctAnswer: 'further away from',
            options: ['further away from', 'closer towards'],
            misconceptionHints: {
              'closer towards': 'Since Qa was already below efficient output Q*, falling to Qb moves quantity even further away from Q*.'
            }
          }
        ],
        sentenceSuffix: ' the efficient output Q*.',
        explanationOnCorrect: 'Correct! Output contracts further away from the socially optimal quantity Q*.'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Step 3: Compare MB and MC gap and Deadweight Loss',
        purpose: 'Explain the widening divergence between MB and MC and the expansion of DWL',
        sentencePrefix: 'The gap between marginal benefit and marginal cost will ',
        blanks: [
          {
            id: 'b3_1',
            placeholder: 'gap trend...',
            correctAnswer: 'increase',
            options: ['increase', 'decrease', 'stay the same'],
            misconceptionHints: {
              decrease: 'As quantity falls from Qa to Qb, MB increases along demand while MC decreases along supply, so (MB - MC) widens.'
            }
          },
          {
            id: 'b3_2',
            placeholder: 'DWL trend...',
            correctAnswer: 'larger',
            options: ['larger', 'smaller', 'unchanged'],
            misconceptionHints: {
              smaller: 'A larger gap between MB and MC over more unproduced units creates a larger deadweight loss area.'
            }
          }
        ],
        sentenceMidfix: [', resulting in a '],
        sentenceSuffix: ' deadweight loss.',
        explanationOnCorrect: 'Correct! The gap (MB - MC) widens, expanding the deadweight loss area.'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: 'Step 4: Conclude on economic efficiency',
        purpose: 'State the final conclusion on efficiency deterioration',
        sentencePrefix: 'Hence, economic efficiency will ',
        blanks: [
          {
            id: 'b4_1',
            placeholder: 'efficiency outcome...',
            correctAnswer: 'worsen',
            options: ['worsen', 'improve', 'remain unchanged'],
            misconceptionHints: {
              improve: 'An increase in deadweight loss signifies a further reduction in total social surplus, meaning efficiency worsens.'
            }
          }
        ],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! Market efficiency worsens due to increased deadweight loss.'
      }
    ],
    modelAnswer:
      'As the price ceiling is lowered from Pa to Pb, the ceiling price decreases and quantity transacted decreases from Qa to Qb. At the new quantity transacted (Qb), quantity transacted decreases further away from the efficient output Q*. The gap between marginal benefit and marginal cost will increase, resulting in a larger deadweight loss. Hence, economic efficiency will worsen.',
    markingRubric: [
      { point: 'Illustrate in supply-demand diagram: lowered ceiling line from Pa to Pb, transacted quantity dropping from Qa to Qb, and increase in deadweight loss shaded', marks: 3 },
      { point: 'State that price decreases to Pb and quantity transacted decreases from Qa to Qb', marks: 1 },
      { point: 'Explain that quantity decreases further away from efficient output and the gap between MB and MC increases', marks: 1 },
      { point: 'State that deadweight loss increases and economic efficiency worsens', marks: 1 },
    ],
    diagramChecklist: [
      'Demand curve D = MB and Supply curve S = MC',
      'Horizontal line Pa and lower horizontal line Pb',
      'Quantities Qa and Qb marked on the horizontal axis along supply curve',
      'Shaded trapezoidal/triangular increase in deadweight loss between Qb and Qa'
    ],
    commonMistakes: [
      'Thinking quantity increases because the lower price boosts quantity demanded: remember that voluntary exchange means transacted quantity is min(Qd, Qs) = Qs',
      'Claiming that consumers are definitely better off: consumer surplus change is uncertain because while price is lower, fewer goods can be bought'
    ]
  },
  {
    id: 'q6-increase-quota',
    title: 'Increasing an Import Quota for Cotton',
    sourceType: 'Source Question (Notes)',
    officialRef: 'Guided Example 16.3 Demonstration',
    marks: 6,
    category: 'change_intervention',
    intervention: 'quota',
    prompt:
      'To boost the local garment industry, the government increases the import quota for cotton. With the aid of a diagram, explain whether an increase in the quota would improve efficiency in the cotton market. (6 marks)',
    diagramPreset: {
      intervention: 'quota',
      params: { quotaQty: 42 },
      showShift: true,
      shiftType: 'right_supply',
      labelAnnotations: {
        P1: 'Original price with lower quota',
        P2: 'New price with higher quota',
        Q1: 'Original quota quantity',
        Q2: 'New higher quota quantity',
        'Q*': 'Efficient output',
      },
    },
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Step 1: Explain the change in supply',
        purpose: 'Explain how raising the quota shifts the quota supply curve',
        sentencePrefix: 'An increase in the import quota will lead to an ',
        blanks: [
          {
            id: 'b1_1',
            placeholder: 'supply change...',
            correctAnswer: 'increase',
            options: ['increase', 'decrease', 'no change'],
            misconceptionHints: {
              decrease: 'Relaxing the quota allows more imported goods to enter, shifting the supply curve rightward.'
            }
          }
        ],
        sentenceSuffix: ' in supply (a rightward shift of the quota supply curve Sq).',
        explanationOnCorrect: 'Correct! The quota supply curve shifts rightward from Sq1 to Sq2.'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Step 2: State the change in price and quantity transacted',
        purpose: 'Identify the resulting price drop and quantity increase',
        sentencePrefix: 'This will lead to a ',
        blanks: [
          {
            id: 'b2_1',
            placeholder: 'price change...',
            correctAnswer: 'decrease',
            options: ['decrease', 'increase'],
            misconceptionHints: {
              increase: 'As more goods are supplied along the downward-sloping demand curve, price falls.'
            }
          },
          {
            id: 'b2_2',
            placeholder: 'quantity change...',
            correctAnswer: 'increase',
            options: ['increase', 'decrease'],
            misconceptionHints: {
              decrease: 'The quota limit is raised, so quantity transacted increases from Q1 to Q2.'
            }
          }
        ],
        sentenceMidfix: [' in price and an '],
        sentenceSuffix: ' in quantity transacted.',
        explanationOnCorrect: 'Correct! Price falls from P1 to P2, and quantity transacted rises from Q1 to Q2.'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Step 3: Relate to efficient output and difference between MB and MC',
        purpose: 'Show how moving closer to Q* narrows the gap between MB and MC',
        sentencePrefix: 'As quantity transacted increases ',
        blanks: [
          {
            id: 'b3_1',
            placeholder: 'relation to Q*...',
            correctAnswer: 'towards',
            options: ['towards', 'away from'],
            misconceptionHints: {
              'away from': 'Because Q1 was below Q*, increasing quantity to Q2 brings output closer to the efficient output Q*.'
            }
          },
          {
            id: 'b3_2',
            placeholder: 'gap trend...',
            correctAnswer: 'decrease',
            options: ['decrease', 'increase'],
            misconceptionHints: {
              increase: 'As output expands toward equilibrium, MB decreases and MC increases, narrowing their difference.'
            }
          }
        ],
        sentenceMidfix: [' the efficient output (Q*), the difference between marginal benefit and marginal cost will '],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! The difference between MB and MC narrows as output moves towards Q*.'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: 'Step 4: Conclude on deadweight loss and efficiency',
        purpose: 'State the final conclusion on efficiency improvement',
        sentencePrefix: 'The deadweight loss will ',
        blanks: [
          {
            id: 'b4_1',
            placeholder: 'DWL trend...',
            correctAnswer: 'decrease',
            options: ['decrease', 'increase'],
            misconceptionHints: {
              increase: 'When output moves closer to the efficient level, the uncaptured social surplus decreases, shrinking deadweight loss.'
            }
          },
          {
            id: 'b4_2',
            placeholder: 'efficiency outcome...',
            correctAnswer: 'improve',
            options: ['improve', 'worsen'],
            misconceptionHints: {
              worsen: 'A smaller deadweight loss means higher total social surplus, so efficiency improves.'
            }
          }
        ],
        sentenceMidfix: [', and economic efficiency will '],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! Deadweight loss decreases and economic efficiency improves.'
      }
    ],
    modelAnswer:
      'An increase in the import quota will lead to an increase in supply (a rightward shift of Sq). This will lead to a decrease in price and an increase in quantity transacted. As quantity transacted increases towards the efficient output (Q*), the difference between marginal benefit and marginal cost will decrease. The deadweight loss will decrease, and economic efficiency will improve.',
    markingRubric: [
      { point: 'Illustrate in supply-demand diagram: rightward shift of quota supply Sq1 to Sq2, price falling from P1 to P2, quantity rising from Q1 to Q2, and decrease in deadweight loss', marks: 3 },
      { point: 'Explain the increase in supply', marks: 1 },
      { point: 'State the decrease in price and increase in quantity transacted', marks: 1 },
      { point: 'Explain that Q moves towards Q*, MB - MC narrows, deadweight loss decreases, and efficiency improves', marks: 1 },
    ],
    diagramChecklist: [
      'Original curves D = MB and S = MC',
      'Quota supply curves Sq1 and shifted Sq2 to the right',
      'Prices P1 falling to P2 and quantities Q1 rising to Q2',
      'Indication of reduction in deadweight loss'
    ],
    commonMistakes: [
      'Stating that the market becomes fully efficient: it only improves because Q2 is still less than Q* if the quota is still binding',
      'Confusing the shift direction of the vertical quota curve'
    ]
  },
  {
    id: 'q7-reduce-unit-subsidy',
    title: 'Reducing Unit Subsidy from $20 to $10',
    sourceType: 'Source Question (Notes)',
    officialRef: 'Guided Example 16.5 / HKDSE 2024 Paper 1 Q20 / 2018 Paper 1 Q22',
    marks: 6,
    category: 'tax_subsidy_change',
    intervention: 'subsidy',
    prompt:
      'The government reduces the per-unit subsidy provided for Good X from $20 to $10. With the aid of a diagram, explain the effect on deadweight loss and total social surplus. (6 marks)',
    diagramPreset: {
      intervention: 'subsidy',
      params: { subsidyRate: 10 },
      showShift: true,
      labelAnnotations: {
        S0: 'MC without subsidy',
        S1: 'Subsidy = $20',
        S2: 'Subsidy = $10',
        Q1: 'Quantity at $20 subsidy',
        Q2: 'Quantity at $10 subsidy',
        'Q*': 'Efficient output',
      },
    },
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Step 1: Explain the shift in the subsidized supply curve',
        purpose: 'Explain how reducing the subsidy shifts the supply curve upward closer to S0',
        sentencePrefix: 'When the unit subsidy is reduced from $20 to $10, the supply curve shifts ',
        blanks: [
          {
            id: 'b1_1',
            placeholder: 'shift direction...',
            correctAnswer: 'upwards',
            options: ['upwards', 'downwards'],
            misconceptionHints: {
              downwards: 'The subsidy was reduced, which means sellers receive a smaller subsidy per unit, shifting supply upwards from S1 towards S0.'
            }
          }
        ],
        sentenceSuffix: ' from S1 (subsidy = $20) to S2 (subsidy = $10).',
        explanationOnCorrect: 'Correct! Reducing the subsidy shifts the supply curve upward from S1 to S2.'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Step 2: State the change in quantity transacted',
        purpose: 'Explain that transacted quantity contracts towards the efficient level',
        sentencePrefix: 'The quantity transacted decreases from Q1 to Q2, moving ',
        blanks: [
          {
            id: 'b2_1',
            placeholder: 'relation to Q*...',
            correctAnswer: 'towards',
            options: ['towards', 'away from'],
            misconceptionHints: {
              'away from': 'Under the $20 subsidy, output was heavily overproduced (Q1 > Q*). Reducing the subsidy causes output to fall back towards Q*.'
            }
          }
        ],
        sentenceSuffix: ' the efficient output Q*.',
        explanationOnCorrect: 'Correct! Transacted quantity falls from Q1 to Q2, moving closer to the efficient output Q*.'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Step 3: Explain the change in Deadweight Loss',
        purpose: 'Show that reducing overproduction reduces deadweight loss',
        sentencePrefix: 'As the extent of overproduction is reduced, the deadweight loss ',
        blanks: [
          {
            id: 'b3_1',
            placeholder: 'DWL change...',
            correctAnswer: 'decreases',
            options: ['decreases', 'increases'],
            misconceptionHints: {
              increase: 'Because output moves closer to Q*, fewer inefficient units where MC > MB are produced, shrinking the deadweight loss.'
            }
          }
        ],
        sentenceSuffix: ' by the area between MC and MB from Q2 to Q1.',
        explanationOnCorrect: 'Correct! The deadweight loss decreases (e.g. from Area afg to Area acd, a decrease of Area dcfg).'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: 'Step 4: Conclude on Total Social Surplus',
        purpose: 'State how reducing deadweight loss affects total social surplus',
        sentencePrefix: 'Because deadweight loss decreases, the total social surplus will ',
        blanks: [
          {
            id: 'b4_1',
            placeholder: 'TSS trend...',
            correctAnswer: 'increase',
            options: ['increase', 'decrease', 'remain uncertain'],
            misconceptionHints: {
              decrease: 'Total social surplus is maximised at Q*. Moving towards Q* reduces DWL, so TSS must increase.',
              'remain uncertain': 'In competitive markets without externalities, any policy moving output towards Q* unambiguously increases TSS.'
            }
          }
        ],
        sentenceSuffix: ' by the same area.',
        explanationOnCorrect: 'Correct! TSS increases by the exact area of DWL eliminated.'
      }
    ],
    modelAnswer:
      'When the unit subsidy is reduced from $20 to $10, the supply curve shifts upwards from S1 to S2. The quantity transacted decreases from Q1 to Q2, moving towards the efficient output Q*. As the extent of overproduction is reduced, the deadweight loss decreases. Because deadweight loss decreases, the total social surplus will increase by the area between MC and MB from Q2 to Q1.',
    markingRubric: [
      { point: 'Illustrate in supply-demand diagram: S0, S1 ($20), S2 ($10), Q1, Q2, Q*, and the reduction in DWL / gain in TSS', marks: 2 },
      { point: 'Explain the upward shift in supply from S1 to S2 and decrease in quantity from Q1 to Q2', marks: 1 },
      { point: 'Explain that quantity moves towards efficient output Q*, reducing overproduction', marks: 1 },
      { point: 'State that deadweight loss decreases and total social surplus increases', marks: 2 },
    ],
    diagramChecklist: [
      'Social MC curve S0 without subsidy',
      'Supply curves S1 ($20 subsidy) and S2 ($10 subsidy)',
      'Quantities Q*, Q2, and Q1 along horizontal axis',
      'Highlighted trapezoid area representing the decrease in deadweight loss / increase in TSS'
    ],
    commonMistakes: [
      'Thinking that reducing a subsidy decreases TSS because consumers pay more: students forget that government subsidy expenditure is drastically reduced, leading to a net social gain',
      'Forgetting that under a subsidy, TSS = CS + PS - Total Subsidy'
    ]
  },
  {
    id: 'q8-supply-decrease-ceiling',
    title: 'Supply Decrease under an Effective Price Ceiling',
    sourceType: 'Source Question (Notes)',
    officialRef: 'Guided Example 16.2 / HKDSE 2023 Paper 1 Q21',
    marks: 5,
    category: 'under_overproduction',
    intervention: 'ceiling',
    prompt:
      'The government imposes an effective price ceiling at Pc. Suppose the supply of Good X decreases from S0 to S1. Explain how the efficient output, the new quantity transacted, and the deadweight loss are determined. (5 marks)',
    diagramPreset: {
      intervention: 'ceiling',
      params: { ceilingPrice: 40 },
      showShift: true,
      shiftType: 'left_supply',
      labelAnnotations: {
        Pc: 'Price ceiling',
        S0: 'Original supply curve',
        S1: 'New supply curve',
        Q1: 'New efficient output',
        Q2: 'New transacted quantity',
      },
    },
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        title: 'Step 1: Identify the new equilibrium without price ceiling',
        purpose: 'Determine the new efficient benchmark output after the supply decrease',
        sentencePrefix: 'After the decrease in supply from S0 to S1, the new efficient equilibrium output ',
        blanks: [
          {
            id: 'b1_1',
            placeholder: 'efficient Q trend...',
            correctAnswer: 'decreases',
            options: ['decreases', 'increases']
          }
        ],
        sentenceMidfix: [' to Q1 and the new equilibrium price '],
        blanksMid: [
          {
            id: 'b1_2',
            placeholder: 'equilibrium P trend...',
            correctAnswer: 'increases',
            options: ['increases', 'decreases']
          }
        ] as any,
        sentenceSuffix: ' to P1.',
        explanationOnCorrect: 'Correct! A decrease in supply causes the intersection with demand to move to a higher price P1 and lower efficient output Q1.'
      },
      {
        id: 's2',
        stepNumber: 2,
        title: 'Step 2: Check whether the price ceiling remains effective',
        purpose: 'Verify that Pc is still below the new equilibrium price',
        sentencePrefix: 'Since the price ceiling Pc is below the new equilibrium price P1, the price ceiling remains ',
        blanks: [
          {
            id: 'b2_1',
            placeholder: 'effectiveness...',
            correctAnswer: 'effective',
            options: ['effective', 'ineffective']
          }
        ],
        sentenceSuffix: '.',
        explanationOnCorrect: 'Correct! Pc < P1, so the price ceiling is still binding and effective.'
      },
      {
        id: 's3',
        stepNumber: 3,
        title: 'Step 3: Determine quantity transacted and underproduction',
        purpose: 'Compare new transacted quantity with the new efficient output',
        sentencePrefix: 'The new quantity transacted (Q2) along S1 is smaller than the new efficient output (Q1), meaning there is ',
        blanks: [
          {
            id: 'b3_1',
            placeholder: 'production condition...',
            correctAnswer: 'underproduction',
            options: ['underproduction', 'overproduction']
          }
        ],
        sentenceSuffix: ' because at Q2, marginal benefit is higher than marginal cost.',
        explanationOnCorrect: 'Correct! Q2 < Q1 and MB > MC, so there is underproduction.'
      },
      {
        id: 's4',
        stepNumber: 4,
        title: 'Step 4: Identify the Deadweight Loss area',
        purpose: 'Identify the triangular area between MB and the new MC curve S1',
        sentencePrefix: 'The deadweight loss is represented by the triangular area between the demand curve (MB) and the ',
        blanks: [
          {
            id: 'b4_1',
            placeholder: 'which MC curve...',
            correctAnswer: 'new supply curve (S1)',
            options: ['new supply curve (S1)', 'original supply curve (S0)', 'price ceiling line']
          }
        ],
        sentenceSuffix: ' from quantity Q2 to Q1.',
        explanationOnCorrect: 'Correct! The deadweight loss is bounded by MB and the new marginal cost curve S1.'
      }
    ],
    modelAnswer:
      'After the decrease in supply from S0 to S1, the new efficient equilibrium output decreases to Q1 and the new equilibrium price increases to P1. Since Pc is below P1, the price ceiling remains effective. The new quantity transacted Q2 is smaller than the new efficient output Q1, meaning there is underproduction because MB is higher than MC. The deadweight loss is the triangular area between the demand curve (MB) and the new supply curve (S1) from quantity Q2 to Q1.',
    markingRubric: [
      { point: 'Illustrate in supply-demand diagram: S0 shifting to S1, price ceiling Pc, new efficient output Q1, transacted quantity Q2, and shaded DWL', marks: 2 },
      { point: 'Determine new equilibrium Point c with efficient output Q1 and check Pc < P1 (effective)', marks: 1 },
      { point: 'Identify new transacted quantity Q2 and explain underproduction (Q2 < Q1, MB > MC)', marks: 1 },
      { point: 'Identify the deadweight loss area bounded by MB and S1', marks: 1 },
    ],
    diagramChecklist: [
      'Demand curve D0 = MB',
      'Supply curves S0 and S1 (shifted left)',
      'Price ceiling horizontal line Pc',
      'Points Q2 (transacted quantity) and Q1 (new efficient output)',
      'Shaded triangle between S1 and D0 from Q2 to Q1'
    ],
    commonMistakes: [
      'Measuring deadweight loss using the original S0 curve instead of the new S1 curve: since supply decreased, production costs have risen to S1, which is now the relevant MC curve',
      'Confusing Q2 with the excess demand quantity'
    ]
  }
];
