const SUPABASE_URL = 'https://siokykpzfklkpbbavmta.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_O_BtU5qsq38qj_G_vls4wg_O9DqHE0s';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Auth = {
  current() {
    const u = sessionStorage.getItem('current_user');
    return u ? JSON.parse(u) : null;
  },

  login: async function(password) {
    password = password.toLowerCase().trim();

    const { data } = await supabaseClient.from('students').select('*').eq('password', password).single();

    if (data) {
      data.role = 'student';
      sessionStorage.setItem('current_user', JSON.stringify(data));
      return data;
    }

    if (password === 'momo12345678') {
      const teacher = { password: 'momo12345678', full_name: 'Teacher', role: 'teacher' };
      sessionStorage.setItem('current_user', JSON.stringify(teacher));
      return teacher;
    }

    return null;
  },

  logout() {
    sessionStorage.removeItem('current_user');
    window.location.href = 'index.html';
  },

  require(role) {
    const user = this.current();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    if (role && user.role !== role && user.password !== 'momo12345678') {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  }
};

const Data = {
  async getSchedule() {
    const { data } = await supabaseClient.from('Schedule').select('*');
    return data || [];
  },

  async addSchedule(item) {
    await supabaseClient.from('Schedule').insert([item]);
  },

  async deleteSchedule(id) {
    await supabaseClient.from('Schedule').delete().eq('id', id);
  },

  async getAttendance(password) {
    let query = supabaseClient.from('Attendance').select('*');
    if (password && password !== 'momo12345678') {
      query = query.eq('student_password', password);
    }
    const { data } = await query;
    return data || [];
  },

  async addAttendance(item) {
    await supabaseClient.from('Attendance').insert([item]);
  },

  async deleteAttendance(id) {
    await supabaseClient.from('Attendance').delete().eq('id', id);
  },

  async getStudents() {
    const { data } = await supabaseClient.from('students').select('*');
    return data || [];
  },

  async addStudent(password, fullName) {
    const { error } = await supabaseClient.from('students').insert([{ 
      password: password.toLowerCase().trim(), 
      full_name: fullName.trim() 
    }]);
    if (error) return { error: 'Error in save' };
    return { ok: true };
  },

  async deleteStudent(password) {
    await supabaseClient.from('students').delete().eq('password', password);
    await supabaseClient.from('Attendance').delete().eq('student_password', password);
  },

  nameOf(password, studentsList) {
    const u = studentsList.find(x => x.password === password);
    return u ? u.full_name : password;
  }
};

function faDate(dateString) {
  if (!dateString) return '-';

  let str = String(dateString);
  str = str.replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).trim();

  let parts = str.split('/');

  if (parts.length === 3) {
    let y, m, d;
    if (parts[0].length === 4) { 
      y = parts[0]; 
      m = parts[1]; 
      d = parts[2]; 
    } else if (parts[2].length === 4) { 
      d = parts[0]; 
      m = parts[1]; 
      y = parts[2]; 
    } else { 
      return str; 
    }

    m = m.padStart(2, '0');
    d = d.padStart(2, '0');

    return `${y}/${m}/${d}`.replace(/\d/g, x => ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'][x]);
  }

  return str;
}

document.addEventListener('DOMContentLoaded', () => {
  const customBanner = localStorage.getItem('custom_banner');
  if (customBanner) {
    const bannerImgs = document.querySelectorAll('.banner-img');
    bannerImgs.forEach(img => img.src = customBanner);
  }
});