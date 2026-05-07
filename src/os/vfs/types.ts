export type VFSId = string;

type Base = {
  id: VFSId;
  name: string;
  parentId: VFSId | null;
  createdAt: number;
};

export type VFSFile = Base & {
  type: "file";
  content: string;
  updatedAt: number;
};

export type VFSFolder = Base & {
  type: "folder";
};

export type VFSNode = VFSFile | VFSFolder;
