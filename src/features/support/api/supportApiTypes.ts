export type SupportContactTopic =
    | "ACCOUNT"
    | "BUG"
    | "BILLING"
    | "PRIVACY"
    | "FEEDBACK"
    | "OTHER";

export type SupportContactRequestDto = {
    name?: string;
    email?: string;
    topic: SupportContactTopic;
    subject: string;
    message: string;
    privacyAccepted: boolean;
    website?: string;
};

export type SupportContactResponseDto = {
    accepted: boolean;
    message: string;
};
