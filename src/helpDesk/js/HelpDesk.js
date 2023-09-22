export default class HelpDesk {
  constructor() {
    this.tickets = document.querySelector('.tickets');
    this.helpDesk = document.querySelector('.helpDesk');
    this.modalAddTicket = document.querySelector('.modal_add_ticket');
    this.modalDeleteTicket = document.querySelector('.modal_delete_ticket');
    this.modalEditTicket = document.querySelector('.modal_edit_ticket');
    this.addForm = document.querySelector('.form_add_ticket');
    this.deleteForm = document.querySelector('.form_delete_ticket');
    this.editForm = document.querySelector('.form_edit_ticket');
    this.url = 'http://localhost:7070/';
    this.xhr = new XMLHttpRequest();
  }

  _createTickets(data) {
    data.forEach((el) => {
      const div = document.createElement('div');
      let check;

      div.className = 'full_ticket';
      div.setAttribute('id', el.id);

      if (el.status) {
        check = ' check';
      } else {
        check = '';
      }

      div.innerHTML = `
        <div class="ticket_show">
          <div class="status${check}"></div>
          <div class="ticket_body">
            <div class="name">${el.name}</div>
            <div class="created">${el.created}</div>
          </div>
          <div class="actions">
            <div class="edit"></div>
            <div class="delete"></div>
          </div>
        </div>
      `;

      this.tickets.append(div);
    });
  }

  _load(callback) {
    this.xhr.addEventListener('load', callback);
  }

  loadTickets() {
    this.xhr.open('GET', `${this.url}?method=allTickets`);
    this.xhr.send();

    const callback = () => {
      if (this.xhr.status >= 200 && this.xhr.status < 300) {
        try {
          const data = JSON.parse(this.xhr.responseText);

          this.tickets.replaceChildren();
          this._createTickets(data);
          this.xhr.abort();
          this.xhr.removeEventListener('load', callback);
        } catch (err) {
          console.error(err);
        }
      }
    };

    this._load(callback);
  }

  _createDescription(el, text) {
    const div = document.createElement('div');

    div.className = 'ticket_hide';
    div.textContent = text;

    el.append(div);
  }

  _showDescription(el) {
    this.xhr.open('GET', `${this.url}?method=ticketById&id=${el.id}`);
    this.xhr.send();

    const callback = () => {
      if (this.xhr.status >= 200 && this.xhr.status < 300) {
        try {
          const data = JSON.parse(this.xhr.responseText);

          this._createDescription(el, data.description);
          this.xhr.abort();
          this.xhr.removeEventListener('load', callback);
        } catch (err) {
          console.error(err);
        }
      }
    };

    this._load(callback);
  }

  description() {
    this.helpDesk.addEventListener('click', (e) => {
      if (e.target.closest('.ticket_body')) {
        const ticket = e.target.closest('.full_ticket');

        if (ticket.querySelector('.ticket_hide')) {
          ticket.querySelector('.ticket_hide').remove();

          return;
        }

        this._showDescription(ticket);
      }
    });
  }

  _openCloseModal(el) {
    el.classList.toggle('active');
  }

  _openAddModal() {
    document.querySelector('.add').addEventListener('click', (e) => {
      e.preventDefault();
      this._openCloseModal(this.modalAddTicket);
    });
  }

  _cancelAddModal() {
    document.querySelector('.add_cancel_btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.addForm.reset();
      this._openCloseModal(this.modalAddTicket);
    });
  }

  addTicket() {
    this._openAddModal();
    this._cancelAddModal();

    this.addForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const body = new FormData(this.addForm);

      body.append('created', new Date().toLocaleString());

      this.xhr.open('POST', `${this.url}?method=createTicket`);
      this.xhr.send(body);

      const callback = () => {
        if (this.xhr.status >= 200 && this.xhr.status < 300) {
          try {
            this.xhr.removeEventListener('load', callback);
            this.loadTickets();
          } catch (err) {
            console.error(err);
          }
        }
      };

      this.addForm.reset();
      this._load(callback);
      this._openCloseModal(this.modalAddTicket);
    });
  }

  _changeStatus(id) {
    this.xhr.open('PATCH', `${this.url}?method=changeStatus&id=${id}`);
    this.xhr.send();

    const callback = () => {
      if (this.xhr.status >= 200 && this.xhr.status < 300) {
        try {
          const data = JSON.parse(this.xhr.responseText);

          this.xhr.abort();
          this.xhr.removeEventListener('load', callback);
          this.loadTickets();
        } catch (err) {
          console.error(err);
        }
      }
    };

    this._load(callback);
  }

  ticketCheck() {
    document.querySelector('.tickets').addEventListener('click', (e) => {
      e.preventDefault();

      if (e.target.classList.contains('status')) {
        const ticketId = e.target.closest('.full_ticket').id;

        this._changeStatus(ticketId);
      }
    });
  }

  _openDeleteModal() {
    document.querySelector('.tickets').addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.className === 'delete') {
        this._openCloseModal(this.modalDeleteTicket);

        this.deleteForm.id = e.target.closest('.full_ticket').id;
      }
    });
  }

  _cancelDeleteModal() {
    document.querySelector('.delete_cancel_btn').addEventListener('click', (e) => {
      e.preventDefault();

      this._openCloseModal(this.modalDeleteTicket);
    });
  }

  deleteTicket() {
    this._openDeleteModal();
    this._cancelDeleteModal();

    this.deleteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      this.xhr.open('DELETE', `${this.url}?method=deleteTicket&id=${this.deleteForm.id}`);
      this.xhr.send();

      const callback = () => {
        if (this.xhr.status >= 200 && this.xhr.status < 300) {
          try {
            this.xhr.abort();
            this.xhr.removeEventListener('load', callback);
            this.loadTickets();
          } catch (err) {
            console.error(err);
          }
        }
      };
      this.deleteForm.id = '';
      this._load(callback);
      this._openCloseModal(this.modalDeleteTicket);
    });
  }

  _openEditModal() {
    document.querySelector('.tickets').addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.className === 'edit') {
        this._openCloseModal(this.modalEditTicket);

        const { id } = e.target.closest('.full_ticket');

        this.xhr.open('GET', `${this.url}?method=ticketById&id=${id}`);
        this.xhr.send();

        const callback = () => {
          if (this.xhr.status >= 200 && this.xhr.status < 300) {
            try {
              const data = JSON.parse(this.xhr.responseText);

              this.editForm.querySelector('.name_input').value = data.name;
              this.editForm.querySelector('.description_input').value = data.description;

              this.xhr.abort();
              this.xhr.removeEventListener('load', callback);
            } catch (err) {
              console.error(err);
            }
          }
        };
        this._load(callback);
        this.editForm.id = id;
      }
    });
  }

  _cancelEditModal() {
    document.querySelector('.edit_cancel_btn').addEventListener('click', (e) => {
      e.preventDefault();

      this.editForm.reset();
      this._openCloseModal(this.modalEditTicket);
    });
  }

  editTicket() {
    this._openEditModal();
    this._cancelEditModal();

    this.editForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const body = new FormData(this.editForm);

      this.xhr.open('PATCH', `${this.url}?method=editTicket&id=${this.editForm.id}`);
      this.xhr.send(body);

      const callback = () => {
        if (this.xhr.status >= 200 && this.xhr.status < 300) {
          try {
            this.xhr.abort();
            this.xhr.removeEventListener('load', callback);
            this.loadTickets();
          } catch (err) {
            console.error(err);
          }
        }
      };
      this._load(callback);
      this.editForm.reset();
      this._openCloseModal(this.modalEditTicket);
    });
  }

  action() {
    this.loadTickets();
    this.description();
    this.addTicket();
    this.ticketCheck();
    this.deleteTicket();
    this.editTicket();
  }
}
