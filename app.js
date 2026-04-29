const SUPABASE_URL = 'https://pgotfsopsozhxhtflgon.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YKyyQR-q1b5r-yiARHMK9Q_8sECFY1C';
const sb = window.supabase?.createClient(SUPABASE_URL, SUPABASE_KEY);

function openModal() {
  document.getElementById('modal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal')?.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(resetWaitlistForm, 250);
}

function toggleMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

function resetWaitlistForm() {
  const formState = document.getElementById('formState');
  const successState = document.getElementById('successState');
  const errorMsg = document.getElementById('errorMsg');
  const submitBtn = document.getElementById('submitBtn');
  if (!formState || !successState) return;

  formState.style.display = 'block';
  successState.style.display = 'none';
  document.getElementById('emailInput').value = '';
  document.getElementById('companyInput').value = '';
  document.getElementById('useCaseInput').value = '';
  document.getElementById('failureInput').value = '';
  errorMsg.style.display = 'none';
  submitBtn.textContent = 'Submit Request';
  submitBtn.disabled = false;
}

async function submitWaitlist() {
  const email = document.getElementById('emailInput').value.trim();
  const company = document.getElementById('companyInput').value.trim();
  const useCase = document.getElementById('useCaseInput').value;
  const failure = document.getElementById('failureInput').value.trim();
  const btn = document.getElementById('submitBtn');
  const errMsg = document.getElementById('errorMsg');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errMsg.textContent = 'Please enter a valid work email.';
    errMsg.style.display = 'block';
    return;
  }

  btn.textContent = 'Submitting...';
  btn.disabled = true;
  errMsg.style.display = 'none';

  const lead = {
    email,
    company: company || null,
    use_case: useCase || null,
    biggest_failure: failure || null
  };

  try {
    if (!sb) throw new Error('Supabase client unavailable');
    const { error } = await sb.from('waitlist').insert([lead]);
    if (error && error.code !== '23505') throw error;
  } catch (error) {
    savePendingLead(lead, error);
  }

  showSuccess();
}

function savePendingLead(lead, error) {
  const pending = JSON.parse(localStorage.getItem('evolvr_pending_waitlist') || '[]');
  pending.push({
    ...lead,
    created_at: new Date().toISOString(),
    reason: error?.message || 'Supabase insert failed'
  });
  localStorage.setItem('evolvr_pending_waitlist', JSON.stringify(pending));
  console.warn('Waitlist request saved locally. Check Supabase URL, API key, table, and RLS policy.', error);
}

function showSuccess() {
  document.getElementById('formState').style.display = 'none';
  document.getElementById('successState').style.display = 'block';
}

document.addEventListener('click', (event) => {
  if (event.target?.id === 'modal') closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});
