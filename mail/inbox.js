document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');


  // Button to submit an email
  document.querySelector('#compose-form').addEventListener('submit', send_email);


});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email_content (id, show_archive_button) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    //show the selected view
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-content-view').style.display = 'block';
    //display email content in a new view-div
    document.querySelector('#email-content-view').innerHTML= ` 
    <span class= "email-detail"> From: </span> <span id="sender" class="email-d-info">${email['sender']}</span><br>
    <span class= "email-detail"> To: </span> <span id="recipient" class="email-d-info">${email['recipients']}</span><br>
    <span class= "email-detail"> Subject: </span> <span id="subject" class="email-d-info"> ${email['subject']} </span><br>
    <span class= "email-detail"> Timestamp: </span> <span id="time-stamp" class="email-d-info"> ${email['timestamp']} </span>
    <hr>
    <p class="m-2">${email['body']}</p>
    <hr>
    `

    //Read email
    if (!email.read){
        fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }

    //Archive and Unarchive
    if (show_archive_button){
      const arch_unarch_button = document.createElement('button');
      arch_unarch_button.innerHTML = email.archived ? "Unarchive" : "Archive";
      arch_unarch_button.className = email.archived ? "btn btn-secondary" : "btn btn-dark"
      arch_unarch_button.addEventListener('click', function() {
          console.log('This element has been clicked!')
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
          })  
            .then(()=> {load_mailbox ('archive')})    
      })
      document.querySelector('#email-content-view').append(arch_unarch_button);
    };

    //Reply button
    const reply_button = document.createElement('button');
    reply_button.innerHTML = "Reply";
    reply_button.className = "btn btn-primary";
    reply_button.addEventListener('click', function() { 
      console.log('This element has been clicked!')
      compose_email ();
      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email['subject'];
      if (subject.split(" ", 1)[0] != "Re:") {
          subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    });
    document.querySelector('#email-content-view').append(reply_button);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Call mailbox 
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Show emails
      emails.forEach(email=> {
        console.log(email);
        //create div for each email
        const emailDetails = document.createElement('div');
        emailDetails.className= "email-preview"
        emailDetails.innerHTML = `
        <span id="sender" class="sender col-3">${email['sender']}</span>
        <span class="subject col-6"> ${email['subject']} </span>
        <span class="timestamp col-3"> ${email['timestamp']} </span>
    `;
        // Assing a class name for read or unread emails
        emailDetails.className = email.read ? 'read': 'unread';
        //Display email content in a new view
        emailDetails.addEventListener('click', function() {
          console.log('This element has been clickedddd!') 
          view_email_content(email.id, mailbox != "sent")
        });
        document.querySelector('#emails-view').append(emailDetails);  
      });  
  });
}


function send_email (event) {
  event.preventDefault();

  // POST request to API
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify ({
      recipients: document.querySelector ('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })

  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent')
});

}




