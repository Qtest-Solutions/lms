-- Add backgroundImage column to CertificateTemplate for full-bleed background images.
alter table public."CertificateTemplate"
  add column "backgroundImage" text;