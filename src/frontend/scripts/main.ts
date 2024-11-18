// Types based on your MongoDB schema
interface ObjectId {
  toString(): string;
}

interface Note {
  _id: string | ObjectId;
  title: string;
  content: string;
  folder: string | ObjectId; // Can be either string or ObjectId depending on how it's returned from API
}

interface Folder {
  _id: string | ObjectId;
  name: string;
}

class FolderManager {
  private folderList: HTMLElement;
  private notesDisplay: HTMLElement;
  private currentlySelectedNote: string | ObjectId | null = null;

  constructor() {
    this.folderList = document.getElementById("folderList")!;
    this.notesDisplay = document.querySelector(".note-display")!;
    this.initializeEventListeners();
    this.loadFolders();
  }

  private initializeEventListeners(): void {
    const newFolderBtn = document.createElement("button");
    newFolderBtn.className = "new-folder-btn";
    newFolderBtn.innerHTML = '<i class="fas fa-plus"></i> New Folder';
    newFolderBtn.onclick = () => this.promptNewFolder();
    this.folderList.parentElement?.appendChild(newFolderBtn);
  }

  private async deleteFolder(
    folderId: string | ObjectId,
    event: Event
  ): Promise<void> {
    event.stopPropagation();

    if (
      !confirm("Are you sure you want to delete this folder and all its notes?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/folders/${folderId.toString()}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete folder");

      await this.loadFolders();
      // Clear note display if a note from this folder was selected
      if (this.notesDisplay.querySelector(".note-content")) {
        this.notesDisplay.innerHTML = "<h2>Select a note to view</h2>";
        this.currentlySelectedNote = null;
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Failed to delete folder");
    }
  }

  private async deleteNote(
    folderId: string | ObjectId,
    noteId: string | ObjectId,
    event: Event
  ): Promise<void> {
    event.stopPropagation();

    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const response = await fetch(
        `/notes/${folderId.toString()}/${noteId.toString()}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete note");

      // Clear currently selected note if we're deleting it
      if (this.currentlySelectedNote === noteId.toString()) {
        this.currentlySelectedNote = null;
        this.notesDisplay.innerHTML = "<h2>Select a note to view</h2>";
      }

      await this.loadFolders();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    }
  }

  private async createNewNote(folderId: string | ObjectId): Promise<void> {
    const title = prompt("Enter note title:");
    if (!title) return;

    const content = prompt("Enter note content:") || "";

    try {
      const response = await fetch(`/notes/${folderId.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) throw new Error("Failed to create note");

      const note: Note = await response.json();
      await this.loadFolders();
      this.displayNote(note);
      this.currentlySelectedNote = note._id.toString();
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Failed to create note");
    }
  }

  private async loadFolders(): Promise<void> {
    try {
      const response = await fetch("/folders");
      const folders = await response.json();
      this.renderFolders(folders);
    } catch (error) {
      console.error("Error loading folders:", error);
    }
  }

  private async promptNewFolder(): Promise<void> {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;

    try {
      const response = await fetch("/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: folderName }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      await this.loadFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder");
    }
  }

  private async loadFolderNotes(folderId: string | ObjectId): Promise<Note[]> {
    const response = await fetch(`/notes/${folderId.toString()}`);
    return await response.json();
  }

  private renderFolders(folders: Folder[]): void {
    this.folderList.innerHTML = "";

    folders.forEach(async (folder) => {
      const li = document.createElement("li");
      li.className = "folder-item";

      const folderHeader = document.createElement("div");
      folderHeader.className = "folder-header";

      const folderContent = document.createElement("div");
      folderContent.className = "folder-content";
      folderContent.innerHTML = `
        <div class="folder-name">
          <i class="fas fa-folder"></i>
          <span>${folder.name}</span>
        </div>
        <button class="delete-btn delete-folder-btn" title="Delete Folder">
          <i class="fas fa-trash"></i>
        </button>
      `;

      const deleteFolderBtn = folderContent.querySelector(".delete-folder-btn");
      deleteFolderBtn?.addEventListener("click", (e) =>
        this.deleteFolder(folder._id, e)
      );

      folderHeader.appendChild(folderContent);

      const arrow = document.createElement("i");
      arrow.className = "fas fa-chevron-right arrow";
      folderHeader.insertBefore(arrow, folderContent);

      const notesContainer = document.createElement("ul");
      notesContainer.className = "notes-container hidden";

      const newNoteBtn = document.createElement("button");
      newNoteBtn.className = "new-note-btn";
      newNoteBtn.innerHTML = '<i class="fas fa-plus"></i> New Note';
      newNoteBtn.onclick = (e) => {
        e.stopPropagation();
        this.createNewNote(folder._id);
      };
      notesContainer.appendChild(newNoteBtn);

      const notes = await this.loadFolderNotes(folder._id);
      notes.forEach((note) => {
        const noteItem = document.createElement("li");
        noteItem.className = "note-item";
        noteItem.dataset.noteId = note._id.toString();

        // Add selected class if this is the currently selected note
        if (this.currentlySelectedNote === note._id.toString()) {
          noteItem.classList.add("selected");
        }

        const noteContent = document.createElement("div");
        noteContent.className = "note-content-wrapper";
        noteContent.innerHTML = `
          <div class="note-info">
            <i class="fas fa-file-alt"></i>
            <span>${note.title}</span>
          </div>
          <button class="delete-btn delete-note-btn" title="Delete Note">
            <i class="fas fa-trash"></i>
          </button>
        `;

        noteContent
          .querySelector(".note-info")
          ?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.switchToNote(note, noteItem);
          });

        noteContent
          .querySelector(".delete-note-btn")
          ?.addEventListener("click", (e) =>
            this.deleteNote(folder._id, note._id, e)
          );

        noteItem.appendChild(noteContent);
        notesContainer.appendChild(noteItem);
      });

      li.appendChild(notesContainer);

      folderHeader.onclick = () => {
        arrow.classList.toggle("rotated");
        notesContainer.classList.toggle("hidden");
      };

      li.insertBefore(folderHeader, li.firstChild);
      this.folderList.appendChild(li);
    });
  }

  private switchToNote(note: Note, noteItem: HTMLElement): void {
    // Remove selected class from all notes
    const allNotes = this.folderList.querySelectorAll(".note-item");
    allNotes.forEach((item) => item.classList.remove("selected"));

    // Add selected class to clicked note
    noteItem.classList.add("selected");

    // Update currently selected note
    this.currentlySelectedNote = note._id.toString();

    // Display the note content
    this.displayNote(note);
  }

  private displayNote(note: Note): void {
    this.notesDisplay.innerHTML = `
      <div class="note-content">
        <h2>${note.title}</h2>
        <div class="note-text">${note.content}</div>
      </div>
    `;
  }
}

// Initialize the FolderManager when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FolderManager();
});
