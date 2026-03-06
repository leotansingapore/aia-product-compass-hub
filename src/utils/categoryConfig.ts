// Configuration for category display (icons, gradients, etc.)
export function getCategoryConfig(categoryName: string) {
  const configs: Record<string, { icon: string; gradient: string; productCount: number }> = {
    'Investment Products': {
      icon: '📈',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      productCount: 3
    },
    'Endowment Products': {
      icon: '💰',
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      productCount: 2
    },
    'Whole Life Products': {
      icon: '🛡️',
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      productCount: 1
    },
    'Term Products': {
      icon: '⏳',
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
      productCount: 2
    },
    'Medical Insurance Products': {
      icon: '🏥',
      gradient: 'bg-gradient-to-r from-red-500 to-red-600',
      productCount: 2
    },
    'Supplementary Training': {
      icon: '📅',
      gradient: 'bg-gradient-to-r from-teal-500 to-teal-600',
      productCount: 0
    }
  };
  
  return configs[categoryName] || {
    icon: '📄',
    gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
    productCount: 0
  };
}