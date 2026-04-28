"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Upload, Send, Shield, Award, Zap, FileText } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { SERVER_ORIGIN } from '@/lib/env';

const TIER_CONFIG = {
  silver: {
    label: 'Silver Partnership',
    icon: <Shield className="w-8 h-8 text-slate-400" />,
    color: 'text-slate-400',
    description: 'Gain visibility and collaborate with our growing network.',
  },
  gold: {
    label: 'Gold Partnership',
    icon: <Award className="w-8 h-8 text-yellow-500" />,
    color: 'text-yellow-500',
    description: 'Deep integration and premium exposure to our VIPs.',
  },
  vip: {
    label: 'VIP Partnership',
    icon: <Zap className="w-8 h-8 text-primary" />,
    color: 'text-primary',
    description: 'The ultimate partnership for maximum impact and reach.',
  },
} as const;

type Tier = keyof typeof TIER_CONFIG;

interface Templates {
  silver: string | null;
  gold: string | null;
  vip: string | null;
}

// ─── Content component — uses useSearchParams() at runtime ───────────────────
// Must be rendered inside a <Suspense> boundary (see PartnerApplyPage below).
function PartnerApplyContent() {
  const searchParams = useSearchParams();
  const rawTier = searchParams.get('tier') ?? 'silver';
  const tier: Tier = rawTier in TIER_CONFIG ? (rawTier as Tier) : 'silver';
  const { toast } = useToast();

  const [templates, setTemplates] = useState<Templates>({ silver: null, gold: null, vip: null });
  const [formData, setFormData] = useState({ name: '', email: '', companyName: '', message: '' });
  const [applicationFile, setApplicationFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = SERVER_ORIGIN;

  useEffect(() => {
    // Public endpoint — no admin credentials needed.
    // GET /admin/settings/partner-templates was admin-only (SV-01); the public
    // mirror at /partnership/templates serves the same read-only data so anyone
    // applying can download the tier template without triggering a 403.
    api.get<Templates>('/partnership/templates', { requiresAuth: false }).then(setTemplates).catch(() => {});
  }, []);

  const tierInfo = TIER_CONFIG[tier];
  const templateUrl = templates[tier];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('email', formData.email);
      body.append('companyName', formData.companyName);
      body.append('message', formData.message);
      body.append('tier', tier);
      if (applicationFile) body.append('applicationFile', applicationFile);

      await api.post('/partnership/apply', body, { requiresAuth: false });
      toast({ title: 'Application Submitted!', description: "We'll review your application and get back to you soon." });
      setFormData({ name: '', email: '', companyName: '', message: '' });
      setApplicationFile(null);
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-4">{tierInfo.icon}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{tierInfo.label}</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">{tierInfo.description}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Left: instructions + download */}
            <div className="md:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Application Template
                    </CardTitle>
                    <CardDescription>
                      Download the {tierInfo.label} template, fill it out, then upload it with your application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {templateUrl ? (
                      <Button asChild className="w-full">
                        <a href={`${API_BASE}${templateUrl}`} target="_blank" rel="noopener noreferrer" download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Template
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No template available yet for this tier. You can still submit your application below.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">How it works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">1</span>
                      <p>Download and fill in the partnership template above.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">2</span>
                      <p>Complete the application form with your details.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">3</span>
                      <p>Upload the completed template and submit.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 font-bold">4</span>
                      <p>Our team will review and respond within 3–5 business days.</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Wrong tier?{' '}
                    <Link href="/partnership" className="text-primary hover:underline">
                      View all packages
                    </Link>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right: form */}
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle>Submit Your Application</CardTitle>
                  <CardDescription>Fill out all required fields and attach your completed template.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="Your full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="your@email.com" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company / Organization *</Label>
                      <Input id="companyName" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder="Your company or organization name" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tell us about your interest *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe why you'd like to partner with us and what value you bring..."
                        rows={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applicationFile">
                        Completed Template{' '}
                        <span className="text-muted-foreground text-xs">(PDF, DOCX, etc.)</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="applicationFile"
                          className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-md px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full"
                        >
                          <Upload className="w-4 h-4 shrink-0" />
                          {applicationFile ? applicationFile.name : 'Click to upload your completed template'}
                          <input
                            id="applicationFile"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.odt"
                            onChange={e => setApplicationFile(e.target.files?.[0] ?? null)}
                          />
                        </label>
                        {applicationFile && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setApplicationFile(null)} className="shrink-0 text-destructive">
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── Page shell — statically renderable ──────────────────────────────────────
// Wraps the content component in <Suspense> so Next.js can pre-render this
// page without resolving search params at build time.
export default function PartnerApplyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <PartnerApplyContent />
    </Suspense>
  );
}
