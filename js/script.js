var Ajax = {
    get: function (url,onresponse) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET",url,true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            onresponse(xhr.responseText, xhr.status, xhr.statusText)
        };
        xhr.send();
    },
    post: function (url,postparams,onresponse) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST",url,true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            onresponse(xhr.responseText, xhr.status, xhr.statusText)
        };
        var data = new FormData();
        for(var prop in postparams){
            data.append(prop,postparams[prop])
        }
        xhr.send(data);
    }
};
var ToDo = {
    usersArray: [],
    userId: "",
    noteId: "",
    init: function () {
        this.bounce.init();
        this.ModuleUsers.init();
        this.ModuleNotes.init();
        this.ModuleDesc.init();
    },
    bounce: {
        init: function () {
            this.fader = document.querySelector(".fade");
            this.hide();
        },
        show: function () {
            this.fader.style.display = "";
        },
        hide: function () {
            this.fader.style.display = "none";
        }
    },
    ModuleUsers: {
        init: function () {
            this.container = document.querySelector(".user");
            this.list = this.container.querySelector(".list");
            this.form = document.forms.addUser;
            this.getUsers();
            this.events();
        },
        getUsers: function () {
            ToDo.bounce.show();
            Ajax.get("http://pdfstep.zzz.com.ua?action=user&method=getAll",function (response) {
                ToDo.usersArray = JSON.parse(response).data;
                this.drawUsers();
                ToDo.bounce.hide()
            }.bind(this));
        },
        drawUsers: function () {
            this.list.innerHTML = "";
            var fragment = document.createDocumentFragment();
            ToDo.usersArray.forEach(function (user) {
                fragment.appendChild(this.createItem(user))
            }.bind(this));
            this.list.appendChild(fragment)
        },
        createItem: function (user) {
            var item = document.createElement("LI");
            var name = document.createElement("P");
            var del = document.createElement("DIV");
            var desc = document.createElement("DIV");
            item.className = "item";
            name.className = "name";
            del.className = "del";
            desc.className = "desc";
            del.dataset.id = user.id;
            desc.dataset.id = user.id;
            name.insertAdjacentText("afterBegin",user.name);
            item.appendChild(name);
            item.appendChild(del);
            item.appendChild(desc);
            return item
        },
        events: function () {
            this.form.addEventListener("submit",function (e) {
                e.preventDefault();
                this.addUser(this.form.elements.name.value);
                this.form.reset();
            }.bind(this));
            this.list.addEventListener("click",function (e) {
                if(e.target.matches(".del")){
                    this.delUser(e.target.dataset.id);
                }
                if(e.target.matches(".desc")){
                    ToDo.userId = e.target.dataset.id;
                    ToDo.ModuleNotes.getNotes(ToDo.userId);
                }
            }.bind(this));

        },
        addUser: function (name) {
            ToDo.bounce.show();
            Ajax.post("http://pdfstep.zzz.com.ua?action=user&method=add",{name:name},function () {
                this.getUsers();
            }.bind(this))
        },
        delUser: function (id) {
            ToDo.bounce.show();
            Ajax.post("http://pdfstep.zzz.com.ua?action=user&method=del",{id:id},function () {
                this.getUsers();
            }.bind(this))
        }
    },
    ModuleNotes: {
        notesArray: [],
        init: function () {
            this.container = document.querySelector(".note");
            this.list = this.container.querySelector(".list");
            this.form = document.forms.addNote;
            this.events();
        },
        getNotes: function (id) {
            ToDo.bounce.show();
            Ajax.post("http://pdfstep.zzz.com.ua?action=todo&method=get",{id:id},function (response) {
                this.notesArray = JSON.parse(response).data;
                this.drawNotes();
                ToDo.bounce.hide();
            }.bind(this));
        },
        drawNotes: function () {
            this.list.innerHTML = "";
            var fragment = document.createDocumentFragment();
            this.notesArray.forEach(function (note) {
                fragment.appendChild(this.createItem(note))
            }.bind(this));
            this.list.appendChild(fragment)
        },
        createItem: function (note) {
            var item = document.createElement("LI");
            var name = document.createElement("P");
            var del = document.createElement("DIV");
            var desc = document.createElement("DIV");
            item.className = "item";
            name.className = "name";
            del.className = "del";
            desc.className = "desc";
            del.dataset.id = note.id;
            desc.dataset.id = note.id;
            name.insertAdjacentText("afterBegin",note.name);
            item.appendChild(name);
            item.appendChild(del);
            item.appendChild(desc);
            return item
        },
        events: function () {
            this.form.addEventListener("submit",function (e) {
                e.preventDefault();
                this.addNote(ToDo.userId,this.form.elements.title.value,this.form.elements.note.value);
                this.form.reset();
            }.bind(this));
            this.list.addEventListener("click",function (e) {
                if(e.target.matches(".del")){
                    this.delNote(e.target.dataset.id);
                }
                if(e.target.matches(".desc")){
                    ToDo.noteId = e.target.dataset.id;
                    ToDo.ModuleDesc.getNote(ToDo.userId,ToDo.noteId);
                }
            }.bind(this));


        },
        addNote: function (id,name,text) {
            ToDo.bounce.show();
            Ajax.post("http://pdfstep.zzz.com.ua?action=todo&method=add",{id:id,name:name,desc:text},function () {
                this.getNotes(ToDo.userId);
            }.bind(this))
        },
        delNote: function (id) {
            ToDo.bounce.show();
            Ajax.post("http://pdfstep.zzz.com.ua?action=todo&method=delete",{id:id},function () {
                this.getNotes(ToDo.userId);
            }.bind(this))
        }
    },
    ModuleDesc: {
        init: function () {
            this.container = document.querySelector(".description");
            this.title = this.container.querySelector(".title");
            this.desc = this.container.querySelector(".desc");
        },
        getNote: function (user,note) {
            ToDo.bounce.show();
            Ajax.post("http://pdfstep.zzz.com.ua?action=todo&method=get", {id: user}, function (response) {
                var noteArr = JSON.parse(response).data;
                for(var i = 0;i < noteArr.length;i++){
                    if(noteArr[i].id === note) this.drawNote(noteArr[i].name,noteArr[i].desc);
                }
                ToDo.bounce.hide();
            }.bind(this));
        },
        drawNote: function (title,desc) {
            this.title.innerHTML = title;
            this.desc.innerHTML = desc;
        }
    }
};
ToDo.init();
