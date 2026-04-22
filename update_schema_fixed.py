#!/usr/bin/env python3
import sys

def update_schema(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip the region field line in any model
        if stripped == 'region String?':
            i += 1
            continue

        # Check for OwnerProfile's fullNameAr
        if stripped == 'fullNameAr      String? @map("full_name_ar")':
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