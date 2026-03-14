(function(){
  if (typeof $ === 'undefined') return;

  function usersKey(){ return 'FIF_USERS'; }
  function currentUserKey(){ return 'FIF_CURRENT_USER'; }

  function getUsers(){ try { return JSON.parse(localStorage.getItem(usersKey()))||[] } catch(e){return[]} }
  function saveUsers(u){ localStorage.setItem(usersKey(), JSON.stringify(u)); }

  // Register form
  $(document).on('submit', '.register-form', function(e){
    e.preventDefault();
    var $f = $(this);
    var name = $f.find('input').eq(0).val().trim();
    var email = $f.find('input').eq(1).val().trim().toLowerCase();
    var pass = $f.find('input').eq(2).val();
    var pass2 = $f.find('input').eq(3).val();
    if (!name||!email||!pass) return alert('Please fill all fields');
    if (pass !== pass2) return alert('Passwords do not match');
    var users = getUsers();
    if (users.find(u=>u.email===email)) return alert('User already exists');
    users.push({ name:name, email:email, password:pass });
    saveUsers(users);
    localStorage.setItem(currentUserKey(), JSON.stringify({name:name,email:email}));
    alert('Registration successful');
    window.location.href = 'index.html';
  });

  // Login form
  $(document).on('submit', '.login-form', function(e){
    e.preventDefault();
    var $f = $(this);
    var email = $f.find('input').eq(0).val().trim().toLowerCase();
    var pass = $f.find('input').eq(1).val();
    var users = getUsers();
    var u = users.find(u=>u.email===email && u.password===pass);
    if (!u) return alert('Invalid credentials');
    localStorage.setItem(currentUserKey(), JSON.stringify({name:u.name,email:u.email}));
    alert('Logged in as ' + u.name);
    window.location.href = 'index.html';
  });

})();