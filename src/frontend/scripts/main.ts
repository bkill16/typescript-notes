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

      await this.loadFolders(); // Refresh folder list
      this.notesDisplay.innerHTML = "<h2>Select a note to view</h2>"; // Clear note display
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

      await this.loadFolders(); // Refresh folder list
      this.notesDisplay.innerHTML = "<h2>Select a note to view</h2>"; // Clear note display
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

      // Create folder container for name and delete button
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

      // Add delete folder handler
      const deleteFolderBtn = folderContent.querySelector(".delete-folder-btn");
      deleteFolderBtn?.addEventListener("click", (e) =>
        this.deleteFolder(folder._id, e)
      );

      folderHeader.appendChild(folderContent);

      // Add dropdown arrow
      const arrow = document.createElement("i");
      arrow.className = "fas fa-chevron-right arrow";
      folderHeader.insertBefore(arrow, folderContent);

      // Create notes container
      const notesContainer = document.createElement("ul");
      notesContainer.className = "notes-container hidden";

      // Create "New Note" button
      const newNoteBtn = document.createElement("button");
      newNoteBtn.className = "new-note-btn";
      newNoteBtn.innerHTML = '<i class="fas fa-plus"></i> New Note';
      newNoteBtn.onclick = (e) => {
        e.stopPropagation();
        this.createNewNote(folder._id);
      };
      notesContainer.appendChild(newNoteBtn);

      // Load and render notes
      const notes = await this.loadFolderNotes(folder._id);
      notes.forEach((note) => {
        const noteItem = document.createElement("li");
        noteItem.className = "note-item";

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

        // Add click handler for note selection
        noteContent
          .querySelector(".note-info")
          ?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.displayNote(note);
          });

        // Add delete note handler
        noteContent
          .querySelector(".delete-note-btn")
          ?.addEventListener("click", (e) =>
            this.deleteNote(folder._id, note._id, e)
          );

        noteItem.appendChild(noteContent);
        notesContainer.appendChild(noteItem);
      });

      li.appendChild(notesContainer);

      // Toggle notes visibility
      folderHeader.onclick = () => {
        arrow.classList.toggle("rotated");
        notesContainer.classList.toggle("hidden");
      };

      li.insertBefore(folderHeader, li.firstChild);
      this.folderList.appendChild(li);
    });
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

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  new FolderManager();
});
