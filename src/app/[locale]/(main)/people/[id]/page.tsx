import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import {
  Linkedin,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Calendar,
  Building2,
} from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

async function getProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      publicTitle: true,
      linkedinUrl: true,
      website: true,
      isProfilePublic: true,
      companyClaims: {
        where: { status: "APPROVED" },
        take: 1,
        select: {
          id: true,
          jobTitle: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              industry: true,
            },
          },
        },
      },
    },
  });

  return user;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, publicTitle: true },
  });

  if (!user) {
    return { title: "Profile Not Found" };
  }

  return {
    title: `${user.name} | People in Tech`,
    description: user.publicTitle || undefined,
  };
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PersonProfilePage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const user = await getProfile(id);

  if (!user) {
    notFound();
  }

  const claim = user.companyClaims[0] ?? null;
  const company = claim?.company ?? null;
  const initial = user.name.charAt(0).toUpperCase();

  // Minimal card for non-public profiles
  if (!user.isProfilePublic) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="size-16 rounded-full border-2 border-white/[0.08] object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-white/[0.08] bg-white/[0.04] text-lg font-bold text-white/60">
                {initial}
              </div>
            )}

            <div>
              <h1 className="font-display text-xl font-bold text-white">
                {user.name}
              </h1>
              {company && claim && (
                <p className="mt-0.5 text-sm text-white/40">
                  {claim.jobTitle} at{" "}
                  <Link
                    href={`/companies/${company.slug}`}
                    className="text-white/50 hover:text-white/70 transition-colors"
                  >
                    {company.name}
                  </Link>
                </p>
              )}
            </div>
          </div>

          {company && claim && (
            <div className="mt-6">
              <CompanyConnectionCard
                company={company}
                jobTitle={claim.jobTitle}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full public profile
  // Fetch jobs posted by the company
  let postedJobs: {
    id: string;
    title: string;
    location: string | null;
    type: string;
    postedAt: Date;
    externalUrl: string;
  }[] = [];

  if (company) {
    postedJobs = await prisma.jobListing.findMany({
      where: {
        companyId: company.id,
        status: "ACTIVE",
      },
      orderBy: { postedAt: "desc" },
      select: {
        id: true,
        title: true,
        location: true,
        type: true,
        postedAt: true,
        externalUrl: true,
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="size-20 rounded-full border-2 border-white/[0.08] object-cover"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full border-2 border-white/[0.08] bg-white/[0.04] text-2xl font-bold text-white/60">
            {initial}
          </div>
        )}

        {/* Name */}
        <h1 className="mt-4 font-display text-2xl font-bold text-white">
          {user.name}
        </h1>

        {/* Public Title */}
        {user.publicTitle && (
          <p className="mt-1 text-sm text-white/50">{user.publicTitle}</p>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/40">
            {user.bio}
          </p>
        )}

        {/* Social Links */}
        {(user.linkedinUrl || user.website) && (
          <div className="mt-4 flex items-center gap-3">
            {user.linkedinUrl && (
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 transition-colors hover:text-white/60"
                aria-label="LinkedIn profile"
              >
                <Linkedin className="size-5" />
              </a>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 transition-colors hover:text-white/60"
                aria-label="Personal website"
              >
                <ExternalLink className="size-5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Company Connection */}
      {company && claim && (
        <div className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">
            Company
          </h2>
          <CompanyConnectionCard
            company={company}
            jobTitle={claim.jobTitle}
          />
        </div>
      )}

      {/* Jobs Posted */}
      {postedJobs.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">
            Active Job Listings
          </h2>
          <div className="space-y-2">
            {postedJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="size-4 shrink-0 text-white/20" />
                  <div>
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {job.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-white/30">
                      {job.location && <span>{job.location}</span>}
                      {job.location && <span>-</span>}
                      <span>{formatJobType(job.type)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/20">
                  <Calendar className="size-3" />
                  <span>{formatDate(job.postedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function CompanyConnectionCard({
  company,
  jobTitle,
}: {
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    industry: string;
  };
  jobTitle: string;
}) {
  const companyInitial = company.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
    >
      {/* Company Logo */}
      {company.logo ? (
        <img
          src={company.logo}
          alt={company.name}
          className="size-12 rounded-xl border border-white/[0.06] bg-white/[0.02] object-cover"
        />
      ) : (
        <div className="flex size-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-sm font-bold text-white/50">
          {companyInitial}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-white group-hover:text-white/90 transition-colors truncate">
            {company.name}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <ShieldCheck className="size-3" />
            Verified Representative
          </span>
        </div>
        <p className="mt-0.5 text-xs text-white/40 truncate">
          {jobTitle}
        </p>
        <p className="mt-0.5 text-xs text-white/25">
          {company.industry}
        </p>
      </div>

      {/* Arrow */}
      <Building2 className="size-4 shrink-0 text-white/15 transition-colors group-hover:text-white/30" />
    </Link>
  );
}

function formatJobType(type: string): string {
  switch (type) {
    case "REMOTE":
      return "Remote";
    case "HYBRID":
      return "Hybrid";
    case "ONSITE":
      return "On-site";
    default:
      return type;
  }
}
