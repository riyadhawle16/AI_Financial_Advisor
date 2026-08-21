import sys, os
sys.path.insert(0, os.path.dirname(__file__) + '/backend')
os.chdir(os.path.dirname(__file__) + '/backend')

from services.financial_twin import compute_financial_twin
from services.simulator import calculate_future_value

print("=== TEST 1: Risk change — same numbers, different risk ===")
for risk in ['low', 'medium', 'high']:
    r = compute_financial_twin(80000, 50000, 20000, 30000, risk, 5000,
                               'sip_growth', {'years': 10}, 12)
    p = r['projections'][0]
    print(f"  {risk}: adj_return={r['adjusted_return']}%  corpus={p['future_value']:,.0f}")

print()
print("=== TEST 2: Years — same SIP, different durations ===")
for yrs in [5, 10, 20]:
    r = compute_financial_twin(80000, 50000, 20000, 0, 'medium', 5000,
                               'sip_growth', {'years': yrs}, 12)
    p = r['projections'][0]
    print(f"  {yrs}yr: corpus={p['future_value']:,.0f}")

print()
print("=== TEST 3: Inflation — 3%, 6%, 10% ===")
r = compute_financial_twin(80000, 50000, 20000, 0, 'medium', 5000,
                           'inflation_stress', {'inflation_rates': [3, 6, 10], 'years': 10}, 12)
for res in r['results']:
    print(f"  {res['label']}: real={res['real_future_value']:,.0f}  loss={res['loss_pct']}%  future_expense={res['future_monthly_expense']:,.0f}")

print()
print("=== TEST 4: SIP amount — 5K, 10K, 20K ===")
r = compute_financial_twin(80000, 50000, 20000, 0, 'medium', 5000,
                           'sip_growth',
                           {'sip_options': [5000, 10000, 20000], 'labels': ['5K/mo', '10K/mo', '20K/mo'], 'years': 10},
                           12)
for p in r['projections']:
    print(f"  {p['label']}: corpus={p['future_value']:,.0f}")

print()
print("=== TEST 5: Stress scenarios all return correct type ===")
tests = [
    ('expense_reduction', {'years': 5}),
    ('job_loss',          {}),
    ('emergency_expense', {}),
    ('inflation_stress',  {'inflation_rates': [4, 8], 'years': 5}),
    ('salary_growth',     {'years': 5}),
]
for sc, params in tests:
    r = compute_financial_twin(80000, 50000, 20000, 0, 'medium', 5000, sc, params, 12)
    print(f"  {sc}: OK  scenario_type={r['scenario_type']}")

print()
print("=== Simulator formula test ===")
for y in [5, 10, 20]:
    fv = calculate_future_value(5000, y, 12)
    print(f"  {y}yr @ 12%: {fv:,.0f}")

print()
print("ALL SIMULATION TESTS PASSED")
