import { baseApi } from "./baseApi";

// ─── Types ───

interface IndexedDocument {
  name: string;
  pages: number;
  chunks: number;
  status: string;
}

interface ListIndexedDocumentsResponse {
  documents: IndexedDocument[];
}

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  pages: number;
  chunks: number;
  uploadedAt: string;
  status: string;
  downloadUrl: string;
}

interface ListDocumentsResponse {
  totalDocuments: number;
  totalChunks: number;
  documents: DocumentItem[];
}

interface UploadDocumentResponse {
  id: string;
  name: string;
  size: string;
  pages: number;
  chunks: number;
  status: string;
  uploadedAt: string;
}

// ─── API Endpoints ───

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listIndexedDocuments: builder.query<ListIndexedDocumentsResponse, void>({
      query: () => "/documents/indexed",
      providesTags: ["IndexedDocuments"],
    }),

    listDocuments: builder.query<
      ListDocumentsResponse,
      { search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/documents",
        params: params || undefined,
      }),
      providesTags: ["Documents"],
    }),

    uploadDocument: builder.mutation<UploadDocumentResponse, FormData>({
      query: (formData) => ({
        url: "/documents/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Documents", "IndexedDocuments", "Landing"],
    }),

    deleteDocument: builder.mutation<{ success: boolean }, string>({
      query: (documentId) => ({
        url: `/documents/${documentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Documents", "IndexedDocuments", "Landing"],
    }),
  }),
});

export const {
  useListIndexedDocumentsQuery,
  useListDocumentsQuery,
  useUploadDocumentMutation,
  useDeleteDocumentMutation,
} = documentsApi;
