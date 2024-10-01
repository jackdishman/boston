export type ComposerActionFormResponse = {
  type: "form";
  title: string;
  url: string;
};

export type ComposerActionMetadata = {
  type: "composer";
  name: string;
  icon: string;
  description: string;
  imageUrl: string;
  aboutUrl?: string;
  action: {
    type: "post";
  };
};
