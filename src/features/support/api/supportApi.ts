import { apiRequest } from "../../../shared/api";
import type {
    SupportContactRequestDto,
    SupportContactResponseDto,
} from "./supportApiTypes";

export async function submitSupportContact(
    request: SupportContactRequestDto,
): Promise<SupportContactResponseDto> {
    return apiRequest<SupportContactResponseDto>("/api/support/contact", {
        method: "POST",
        body: request,
        requiresAuth: true,
    });
}
