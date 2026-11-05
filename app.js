// ============================================
// ذخیره‌سازی داده‌ها داخل مرورگر (localStorage)
// ============================================
// همه چیز توی مرورگر خودت ذخیره می‌شه. هیچ سروری لازم نیست.

const DB = {
  // اگه اولین باره، داده‌ی نمونه می‌سازه
  init() {
    if (!localStorage.getItem('school_db')) {
      const seed = {
        users: [
          { password: 'teacher', full_name: 'خانم معلم', role: 'teacher' },
          { password: 'ali123',  full_name: 'علی رضایی',  role: 'student' },
          { password: 'sara456', full_name: 'سارا محمدی', role: 'student' },
          { password: 'reza789', full_name: 'رضا کریمی',  role: 'student' }
        ],
        schedule: [
          { id: 's1', day: 'شنبه',   lesson: 'ریاضی', topic: 'فصل ۲ - معادله',    homework: 'تمرین صفحه ۲۵' },
          { id: 's2', day: 'شنبه',   lesson: 'فارسی', topic: 'درس ۳ - شعر',       homework: 'حفظ شعر' },
          { id: 's3', day: 'یکشنبه', lesson: 'علوم',  topic: 'فصل ۱ - سلول',      homework: 'تحقیق درباره سلول' }
        ],
        attendance: [
          { id: 'a1', password: 'ali123',  date: '2025-10-25', status: 'absent' },
          { id: 'a2', password: 'sara456', date: '2025-10-25', status: 'late' }
        ]
      };
      localStorage.setItem('school_db', JSON.stringify(seed));
    }
  },

  get() {
    return JSON.parse(localStorage.getItem('school_db'));
  },

  save(data) {
    localStorage.setItem('school_db', JSON.stringify(data));
  },

  // پاک کردن همه چیز و برگشتن به حالت اول
  reset() {
    if (confirm('همه‌ی داده‌ها پاک بشن و به حالت اولیه برگرده؟')) {
      localStorage.removeItem('school_db');
      sessionStorage.removeItem('current_user');
      location.reload();
    }
  }
};

DB.init();

// ============================================
// ورود و خروج
// ============================================

const Auth = {
  login(password) {
    const db = DB.get();
    const user = db.users.find(u => u.password === password.toLowerCase().trim());
    if (user) {
      sessionStorage.setItem('current_user', JSON.stringify(user));
      return user;
    }
    return null;
  },

  current() {
    const u = sessionStorage.getItem('current_user');
    return u ? JSON.parse(u) : null;
  },

  logout() {
    sessionStorage.removeItem('current_user');
    window.location.href = 'index.html';
  },

  // اگه کاربر لاگین نباشه یا نقشش درست نباشه، می‌فرسته بیرون
  require(role) {
    const user = this.current();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    if (role && user.role !== role) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  }
};

// ============================================
// داده‌ها
// ============================================

const Data = {
  // برنامه هفتگی
  getSchedule() {
    return DB.get().schedule;
  },
  addSchedule(item) {
    const db = DB.get();
    item.id = Date.now().toString();
    db.schedule.push(item);
    DB.save(db);
  },
  deleteSchedule(id) {
    const db = DB.get();
    db.schedule = db.schedule.filter(s => s.id !== id);
    DB.save(db);
  },

  // غیبت و تاخیر
  getAttendance(password) {
    const all = DB.get().attendance;
    return password ? all.filter(a => a.password === password) : all;
  },
  addAttendance(item) {
    const db = DB.get();
    item.id = Date.now().toString();
    db.attendance.push(item);
    DB.save(db);
  },
  deleteAttendance(id) {
    const db = DB.get();
    db.attendance = db.attendance.filter(a => a.id !== id);
    DB.save(db);
  },

  // دانش‌آموزها
  getStudents() {
    return DB.get().users.filter(u => u.role === 'student');
  },
  addStudent(password, fullName) {
    const db = DB.get();
    password = password.toLowerCase().trim();
    if (!password || !fullName.trim()) return { error: 'همه‌ی فیلدها الزامی است' };
    if (db.users.find(u => u.password === password)) return { error: 'این رمز قبلاً استفاده شده' };
    db.users.push({ password, full_name: fullName.trim(), role: 'student' });
    DB.save(db);
    return { ok: true };
  },
  deleteStudent(password)

{
    const db = DB.get();
    db.users = db.users.filter(u => !(u.password === password && u.role === 'student'));
    db.attendance = db.attendance.filter(a => a.password !== password);
    DB.save(db);
  },

  // پیدا کردن اسم دانش‌آموز از روی رمزش
  nameOf(password) {
    const u = DB.get().users.find(x => x.password === password);
    return u ? u.full_name : password;
  }
};
// ============================================
// تاریخ فارسی
// ============================================

function toPersianDigits(str) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, x => persianDigits[x]);
}
// ============================================
// تاریخ فارسی هوشمند
// ============================================

function toPersianDigits(str) {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, x => persianDigits[x]);
}

function faDate(dateString) {
  if (!dateString) return '—';
  
  // ۱. تبدیل اعداد فارسی به انگلیسی (اگه با کیبورد فارسی تایپ کرده باشی)
  let cleanStr = dateString.replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).trim();
  
  // ۲. هر علامتی مثل - یا . رو تبدیل به / می‌کنیم
  cleanStr = cleanStr.replace(/[\.\-]/g, '/');
  
  let parts = cleanStr.split('/');
  
  // اگه فرمت درست نبود، همون چیزی که تایپ شده رو نشون بده
  if (parts.length !== 3) return dateString; 

  let y, m, d;
  
  // ۳. تشخیص هوشمندانه: اگه قسمت اول ۴ رقم بود، یعنی سال اوله (مثل 1405/11/12)
  if (parts[0].length === 4) {
    y = parts[0];
    m = parts[1].padStart(2, '0'); // اگه ماه 1 باشه، میکنه 01
    d = parts[2].padStart(2, '0');
  } 
  // اگه قسمت آخر ۴ رقم بود، یعنی سال آخره (مثل 12/11/1405)
  else if (parts[2].length === 4) {
    d = parts[0].padStart(2, '0');
    m = parts[1].padStart(2, '0');
    y = parts[2];
  } else {
    return dateString; 
  }

  // در نهایت همه رو به شکل سال/ماه/روز استاندارد درمیاریم
  return toPersianDigits(`${y}/${m}/${d}`);
}
// ============================================
// بارگذاری عکس بنر سفارشی
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const customBanner = localStorage.getItem('custom_banner');
  if (customBanner) {
    const bannerImgs = document.querySelectorAll('.banner-img');
    bannerImgs.forEach(img => img.src = customBanner);
  }
});
