"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase-client";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
  MoreHorizontal,
  Edit,
  Trash,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  children?: Folder[];
}

interface FolderSidebarProps {
  userId: string;
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
}

export default function FolderSidebar({
  userId,
  selectedFolderId,
  onFolderSelect,
}: FolderSidebarProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("note_folders")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;

      // Organize folders into a tree structure
      const folderMap = new Map<string, Folder>();
      const rootFolders: Folder[] = [];

      // First pass: create map of all folders
      data?.forEach((folder) => {
        folderMap.set(folder.id, { ...folder, children: [] });
      });

      // Second pass: build the tree
      data?.forEach((folder) => {
        if (folder.parent_id) {
          const parent = folderMap.get(folder.parent_id);
          if (parent && parent.children) {
            parent.children.push(folderMap.get(folder.id)!);
          }
        } else {
          rootFolders.push(folderMap.get(folder.id)!);
        }
      });

      setFolders(rootFolders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for the folder",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("note_folders")
        .insert({
          name: newFolderName.trim(),
          user_id: userId,
          parent_id: selectedParentId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" has been created`,
      });

      setNewFolderName("");
      setSelectedParentId(null);
      setIsCreateDialogOpen(false);
      fetchFolders();

      // Expand the parent folder if it exists
      if (selectedParentId) {
        setExpandedFolders((prev) => ({ ...prev, [selectedParentId]: true }));
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a name for the folder",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("note_folders")
        .update({
          name: newFolderName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingFolder.id);

      if (error) throw error;

      toast({
        title: "Folder updated",
        description: `Folder has been renamed to "${newFolderName}"`,
      });

      setNewFolderName("");
      setEditingFolder(null);
      setIsEditDialogOpen(false);
      fetchFolders();
    } catch (error) {
      console.error("Error updating folder:", error);
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;

    try {
      const supabase = createClient();

      // First update any notes in this folder to have null folder_id
      const { error: updateError } = await supabase
        .from("notes")
        .update({ folder_id: null })
        .eq("folder_id", deletingFolder.id);

      if (updateError) throw updateError;

      // Then delete the folder
      const { error } = await supabase
        .from("note_folders")
        .delete()
        .eq("id", deletingFolder.id);

      if (error) throw error;

      toast({
        title: "Folder deleted",
        description: `Folder "${deletingFolder.name}" has been deleted`,
      });

      // If the deleted folder was selected, reset selection
      if (selectedFolderId === deletingFolder.id) {
        onFolderSelect(null);
      }

      setDeletingFolder(null);
      setIsDeleteDialogOpen(false);
      fetchFolders();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const openEditDialog = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingFolder(folder);
    setIsDeleteDialogOpen(true);
  };

  const renderFolderTree = (folderList: Folder[], level = 0) => {
    return folderList.map((folder) => (
      <div key={folder.id} className="flex flex-col">
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-accent group",
            selectedFolderId === folder.id && "bg-accent",
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => onFolderSelect(folder.id)}
        >
          <button
            className="mr-1 h-4 w-4 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
          >
            {folder.children && folder.children.length > 0 ? (
              expandedFolders[folder.id] ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )
            ) : (
              <span className="w-3" />
            )}
          </button>
          <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm flex-grow truncate">{folder.name}</span>
          <div className="opacity-0 group-hover:opacity-100 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => openEditDialog(folder, e)}>
                  <Edit className="h-4 w-4 mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => openDeleteDialog(folder, e)}>
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {folder.children &&
          folder.children.length > 0 &&
          expandedFolders[folder.id] && (
            <div className="ml-2">
              {renderFolderTree(folder.children, level + 1)}
            </div>
          )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-4 flex items-center justify-between border-b">
        <h3 className="font-medium">Folders</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setNewFolderName("");
            setSelectedParentId(null);
            setIsCreateDialogOpen(true);
          }}
          title="Create new folder"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-grow overflow-auto p-2">
        <div
          className={cn(
            "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-accent mb-2",
            selectedFolderId === null && "bg-accent",
          )}
          onClick={() => onFolderSelect(null)}
        >
          <File className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">All Notes</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : folders.length > 0 ? (
          renderFolderTree(folders)
        ) : (
          <div className="text-center p-4 text-sm text-muted-foreground">
            No folders yet
          </div>
        )}
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parent-folder">Parent Folder (Optional)</Label>
              <select
                id="parent-folder"
                className="w-full p-2 border rounded-md"
                value={selectedParentId || ""}
                onChange={(e) => setSelectedParentId(e.target.value || null)}
              >
                <option value="">None (Root level)</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateFolder}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the folder "{deletingFolder?.name}
              "?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Notes in this folder will not be deleted, but they will be moved
              to the root level.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFolder}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
