import { Link } from "react-router-dom";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  HeartPulse,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Sales-relevant talking points for AIA Ultimate Critical Cover (UCC).
 * Source: AIA UCC Product Summary v1.0 (012024). Use as a quick-reference
 * cheat sheet when running a coverage conversation — always defer to the
 * actual policy contract for binding terms.
 */
export default function UccSalesInfo() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-foreground/80">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <p>
            Quick-reference sales talking points pulled from the AIA UCC Product Summary
            v1.0 (012024). Always corroborate with the actual policy contract and
            current Benefit Illustration before quoting figures to a client.
          </p>
        </div>
      </div>

      {/* Hero pillars */}
      <section>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground">
          Why UCC stands out
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">73 critical illnesses</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Major Stage covers all 73; 42 are also covered at Early Stage and 35 at
                  Intermediate Stage — far beyond the 37 LIA standard severe-stage CIs.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">Multi-stage payouts</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pays at Early, Intermediate and Major Stage of the same condition — up to
                  100% of insured amount in total per CI, with separate Early/Intermediate
                  caps of S$350,000 each.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">Ultimate Reset Benefit</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  12 months after a paid CI claim, the Current Insured Amount restores to
                  100% of the original insured amount — with <em>no cap</em> on the number
                  of resets while the policy is in force.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">500% early-stage cap</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Total claims paid under Early- and Intermediate-Stage CIs may reach up to
                  500% of the insured amount of the basic policy — meaningful payouts
                  before a Major Stage diagnosis.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">AIA Vitality discount</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Integrate with AIA Vitality for an upfront 5% discount (95% Cumulative
                  Premium Percentage at inception) and ongoing Status-based adjustments —
                  Platinum saves up to 15% (floor 85%).
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">3 plan terms</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  UCC (To Age 65), UCC (To Age 75), and UCC (To Age 85) — match the term
                  to the client's protection horizon (income years vs. lifetime CI cover).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Claim limit table */}
      <section>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground">
          Maximum claim limit by severity
        </h2>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity Level</TableHead>
                <TableHead className="w-[160px] text-right">Maximum claim limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Early Stage Critical Illness</TableCell>
                <TableCell className="text-right font-mono">S$350,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Intermediate Stage Critical Illness</TableCell>
                <TableCell className="text-right font-mono">S$350,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Major Stage — Angioplasty &amp; Other Invasive Treatment for Coronary
                  Artery
                </TableCell>
                <TableCell className="text-right font-mono">S$25,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Major Stage — all other 72 conditions
                </TableCell>
                <TableCell className="text-right font-mono">No cap</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Per-life CI aggregate limit of <span className="font-medium text-foreground">S$3,000,000</span>{" "}
          across all related AIA policies / supplementary benefits on the same Insured.
        </p>
      </section>

      {/* Benefits cheatsheet */}
      <section>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground">
          Benefits at a glance
        </h2>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Critical Illness Benefit</Badge>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/90">
                <li>Pays the lower of <span className="font-medium">100% of Current Insured Amount</span> or the stage's Maximum Claim Limit.</li>
                <li>Insured must <span className="font-medium">survive 7 days</span> from date of diagnosis or surgery for the claim to be admitted.</li>
                <li>Angioplasty &amp; Other Invasive Treatment for Coronary Artery pays <span className="font-medium">10% of Current Insured Amount</span> (capped at S$25,000).</li>
                <li>Only one claim per stage per condition; multiple same-day diagnoses pay one claim at the most severe stage.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Death Benefit</Badge>
              </div>
              <p className="mt-2 text-sm text-foreground/90">
                If the Insured dies and Accidental Death Benefit is not payable, UCC pays
                <span className="font-medium"> 5% of the Insured Amount</span> as Death Benefit.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Accidental Death Benefit</Badge>
              </div>
              <p className="mt-2 text-sm text-foreground/90">
                Pays <span className="font-medium">100% of the Insured Amount</span> if death
                results from an accident within 365 days. Accident scope explicitly extends
                to riot &amp; civil commotion, terrorism, drowning &amp; suffocation, natural
                disasters, disappearance after a transport accident, hijack/murder/assault,
                food poisoning, private flight (overseas business trips), insect/animal
                bites including <span className="font-medium">dengue and Zika</span>, amateur
                sports, and motorcycling (helmet + valid licence).
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Maximum aggregate Accidental Death Benefit across all AIA prior policies on
                the same life: <span className="font-medium">S$5,000,000</span>.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Ultimate Reset Benefit</Badge>
              </div>
              <p className="mt-2 text-sm text-foreground/90">
                12 months after a CI claim is admitted, the Current Insured Amount is
                restored to <span className="font-medium">100% of the original insured
                amount</span>. There is <span className="font-medium">no cap</span> on the
                number of resets while the basic policy remains in force — the client can
                effectively re-arm UCC after each major event.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Vitality table */}
      <section>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground">
          AIA Vitality premium adjustment
        </h2>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vitality Status</TableHead>
                <TableHead className="text-right">Annual premium adjustment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Bronze</TableCell>
                <TableCell className="text-right font-mono text-rose-600 dark:text-rose-400">+2%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Silver</TableCell>
                <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">+1%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gold</TableCell>
                <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">−1%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Platinum</TableCell>
                <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">−2%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Cumulative Premium Percentage starts at 95% on inception and is updated each
          policy anniversary based on Vitality Status 45 days prior, bounded between
          <span className="font-medium text-foreground"> 85% (best)</span> and{" "}
          <span className="font-medium text-foreground">100% (worst)</span>.
        </p>
      </section>

      {/* What to flag */}
      <section>
        <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground">
          What to flag during fact-find
        </h2>
        <div className="space-y-2">
          <Card>
            <CardContent className="flex items-start gap-3 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              <p className="text-sm text-foreground/90">
                <span className="font-medium">Free-look period:</span> 14 days from receipt
                of the policy documents.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              <p className="text-sm text-foreground/90">
                <span className="font-medium">90-day waiting period</span> applies for Heart
                Attack of Specified Severity, Major Cancer, Coronary Artery By-pass Surgery,
                Angioplasty &amp; Other Invasive Treatment for Coronary Artery, and Other
                Serious Coronary Artery Disease — diagnoses within 90 days of issue or
                reinstatement are excluded.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              <p className="text-sm text-foreground/90">
                <span className="font-medium">Premiums are non-guaranteed</span> — AIA may
                revise on a class basis (never on an individual basis). Set this expectation
                upfront.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
              <p className="text-sm text-foreground/90">
                <span className="font-medium">Claim window:</span> 90 days from date of
                diagnosis (or surgical procedure) to file the CI claim; 60 days for death
                claims.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-3">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden />
              <p className="text-sm text-foreground/90">
                <span className="font-medium">SDIC-protected:</span> the policy is covered
                under the Policy Owners' Protection Scheme administered by the Singapore
                Deposit Insurance Corporation. Coverage is automatic.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-start gap-3 p-3">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
              <p className="text-sm text-foreground/90">
                <span className="font-medium">Coronary tie-rule:</span> if a claim is paid
                under Early- or Intermediate-Stage Other Serious Coronary Artery Disease,
                no further Early-Stage Coronary Artery By-pass Surgery claim is payable
                (and vice versa).
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cross-link */}
      <section>
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Need the full clinical definition for any condition?
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Browse all 73 critical illnesses with Early / Intermediate / Major Stage
                wording — search by name or symptom.
              </p>
            </div>
            <Link
              to="/critical-illness-conditions"
              className="inline-flex items-center gap-1.5 self-start rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sm:self-center"
            >
              Open conditions list
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
