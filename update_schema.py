#!/usr/bin/env python3
import sys

def update_schema(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        new_lines.append(line)

        # Check if we are in OwnerProfile model and after fullNameAr line
        if line.strip() == 'model OwnerProfile {' or new_lines[-2].strip() == 'model OwnerProfile {':
            # We'll look for the fullNameAr line to insert after
            pass

        # Instead of trying to be too clever, we'll do simple string matching for the lines we want to change.
        # We'll process the file and when we see a line that matches certain patterns, we'll insert or skip.

        i += 1

    # Actually, let's do a simpler approach: we know the exact lines we want to change and insert.
    # We'll write a new list of lines by scanning and making changes.

    # Reset and do a fresh pass.
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Check for region field in the three models and skip it.
        if stripped.startswith('region String?') or stripped == 'region String?':
            # We are in one of the models and see the region line -> skip it (do not add to new_lines)
            i += 1
            continue

        # Check for OwnerProfile's fullNameAr line to insert after
        if stripped == 'fullNameAr      String? @map("full_name_ar")' and 'OwnerProfile' in ''.join(new_lines[-10:]):
            new_lines.append(line)
            # Insert the new fields after this line
            new_lines.append('  legalName       String  @map("legal_name")\n')
            new_lines.append('  legalNameAr     String? @map("legal_name_ar")\n')
            new_lines.append('  companyCr       String? @map("company_cr")\n')
            i += 1
            continue

        # Check for ContractorProfile: we don't have fullNameAr, but we have companyNameAr.
        # We want to insert after companyNameAr in ContractorProfile.
        if stripped == 'companyNameAr      String?            @map("company_name_ar")' and 'ContractorProfile' in ''.join(new_lines[-10:]):
            new_lines.append(line)
            # Insert the new fields after this line
            new_lines.append('  legalName       String  @map("legal_name")\n')
            new_lines.append('  legalNameAr     String? @map("legal_name_ar")\n')
            new_lines.append('  companyCr       String? @map("company_cr")\n')
            i += 1
            continue

        # Check for EngineerProfile's fullNameAr line to insert after
        if stripped == 'fullNameAr         String?            @map("full_name_ar")' and 'EngineerProfile' in ''.join(new_lines[-10:]):
            new_lines.append(line)
            # Insert the new fields after this line
            new_lines.append('  legalName       String  @map("legal_name")\n')
            new_lines.append('  legalNameAr     String? @map("legal_name_ar")\n')
            i += 1
            continue

        # If we didn't continue, add the line as is.
        # But note: we already added the line at the top of the loop? 
        # We are going to change the approach: we will not add the line at the top, but only when we decide to keep it.

        # Let's restart the loop logic: we will process line by line and decide what to do.

        # Actually, let's rewrite the loop more clearly.

        break  # We'll break and rewrite the loop.

    # Instead, let's do a simple line-by-line processing with state.

    # We'll start over.
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip region field in any of the three models
        if stripped == 'region String?' or stripped == 'region String?':
            # Skip this line (do not add to new_lines)
            i += 1
            continue

        # Check for OwnerProfile's fullNameAr
        if stripped == 'fullNameAr      String? @map("full_name_ar")':
            # We are in OwnerProfile? We'll check the context by looking back a few lines for "model OwnerProfile {"
            # But for simplicity, we'll assume that if we see this line, we are in OwnerProfile because it's unique.
            new_lines.append(line)
            new_lines.append('  legalName       String  @map("legal_name")\n')
            new_lines.append('  legalNameAr     String? @map("legal_name_ar")\n')
            new_lines.append('  companyCr       String? @map("company_cr")\n')
            i += 1
            continue

        # Check for ContractorProfile's companyNameAr
        if stripped == 'companyNameAr      String?            @map("company_name_ar")':
            new_lines.append(line)
            new_lines.append('  legalName       String  @map("legal_name")\n')
            new_lines.append('  legalNameAr     String? @map("legal_name_ar")\n')
            new_lines.append('  companyCr       String? @map("company_cr")\n')
            i += 1
            continue

        # Check for EngineerProfile's fullNameAr
        if stripped == 'fullNameAr         String?            @map("full_name_ar")':
            new_lines.append(line)
            new_lines.append('  legalName       String  @map("legal_name")\n')
            new_lines.append('  legalNameAr     String? @map("legal_name_ar")\n')
            i += 1
            continue

        # If we didn't continue, add the line.
        new_lines.append(line)
        i += 1

    # Write the updated schema back
    with open(file_path, 'w') as f:
        f.writelines(new_lines)

if __name__ == '__main__':
    schema_path = '/home/ubunto/.openclaw/workspace/linex-forsa/prisma/schema.prisma'
    update_schema(schema_path)
    print(f"Updated {schema_path}")