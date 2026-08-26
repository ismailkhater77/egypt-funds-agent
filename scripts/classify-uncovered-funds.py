import json
from pathlib import Path

report = json.loads(Path('/home/ubuntu/egypt-funds-agent/reports/upload-coverage-report.json').read_text(encoding='utf-8'))
items = report['not_covered']
def classify(item):
    name = f"{item.get('file_name','')} {item.get('company','')}".lower()
    rules = [
        ('GIG / PFI', ['gig ', 'pfi cashi', 'makaseb']),
        ('Ebank', ['ebank']),
        ('Al Ahli Bank of Kuwait', ['kuwait - egypt', 'kuwait (']),
        ('Blom Bank', ['blom']),
        ('National Bank of Kuwait', ['national bank of kuwait']),
        ('Naeem', ['naeem']),
        ('ALEXBANK', ['alexbank']),
        ('NI Capital', ['ni capital']),
        ('Odin', ['odin']),
        ('Aspire', ['aspire']),
        ('Menthum', ['menthum']),
        ('SAIB', ['saib']),
        ('FAB Misr', ['fab misr']),
        ('Al Baraka', ['al baraka']),
        ('Agricultural Bank of Egypt', ['agriculural bank', 'agricultural bank']),
        ('Arope Insurance', ['arope insurance']),
        ('Delta Life', ['delta life']),
        ('Egyptian Arab Land Bank', ['egyptian arab land bank']),
        ('Prime', ['prime nmow']),
        ('Sigma', ['sigma']),
        ('Azimut', ['azimut']),
        ('Charity/Education', ['charitable', 'bokra']),
        ('Independent/unknown', []),
    ]
    for label, needles in rules:
        if any(needle in name for needle in needles): return label
    return 'Independent/unknown'

classified = []
for item in items:
    classified.append({**item, 'priority_group': classify(item)})
summary = {}
for item in classified:
    summary[item['priority_group']] = summary.get(item['priority_group'], 0) + 1
out = {'source_report': 'reports/upload-coverage-report.json', 'uncovered_count': len(classified), 'group_counts': dict(sorted(summary.items())), 'funds': classified}
Path('/home/ubuntu/egypt-funds-agent/reports/uncovered-funds-priority.json').write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'uncovered_count': len(classified), 'group_counts': dict(sorted(summary.items()))}, ensure_ascii=False, indent=2))
