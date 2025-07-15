import { ExternalLink, BookOpen, GraduationCap, Calculator, FileText, Globe, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsefulLink {
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  category: "learning" | "tools" | "external" | "support";
}

const usefulLinks: UsefulLink[] = [
  {
    title: "SCI College Student Portal",
    description: "Access your CMFAS exam materials and question banks",
    url: "https://www.scicollege.org.sg/Account/Register",
    icon: <GraduationCap className="w-5 h-5" />,
    category: "learning"
  },
  {
    title: "MAS Guidelines",
    description: "Official Monetary Authority of Singapore regulatory guidelines",
    url: "https://www.mas.gov.sg/regulation/guidelines",
    icon: <FileText className="w-5 h-5" />,
    category: "external"
  },
  {
    title: "AIA Singapore",
    description: "Official AIA Singapore website and product information",
    url: "https://www.aia.com.sg",
    icon: <Globe className="w-5 h-5" />,
    category: "external"
  },
  {
    title: "Life Insurance Calculator",
    description: "Calculate coverage needs and premium estimates",
    url: "https://www.aia.com.sg/en/our-products/life-insurance.html",
    icon: <Calculator className="w-5 h-5" />,
    category: "tools"
  },
  {
    title: "CMFAS Exam Guide",
    description: "Complete preparation guide for all CMFAS modules",
    url: "/cmfas-exams",
    icon: <BookOpen className="w-5 h-5" />,
    category: "learning"
  },
  {
    title: "Technical Support",
    description: "Get help with platform issues and technical questions",
    url: "mailto:support@aiaproductcompass.com",
    icon: <Phone className="w-5 h-5" />,
    category: "support"
  }
];

const categoryColors = {
  learning: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  tools: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", 
  external: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  support: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
};

const categoryTitles = {
  learning: "📚 Learning Resources",
  tools: "🛠️ Useful Tools",
  external: "🌐 External Links", 
  support: "💬 Support"
};

export function UsefulLinksSection() {
  const groupedLinks = usefulLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, UsefulLink[]>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Useful Links</h2>
      
      {Object.entries(groupedLinks).map(([category, links]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-4">{categoryTitles[category as keyof typeof categoryTitles]}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link, index) => (
              <Card 
                key={index} 
                className={`${categoryColors[link.category as keyof typeof categoryColors]} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => {
                  if (link.url.startsWith('http') || link.url.startsWith('mailto:')) {
                    window.open(link.url, '_blank', 'noopener,noreferrer');
                  } else {
                    window.location.href = link.url;
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {link.icon}
                    {link.title}
                    {(link.url.startsWith('http') || link.url.startsWith('mailto:')) && (
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}