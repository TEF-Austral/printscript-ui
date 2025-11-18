import {useMutation, UseMutationResult, useQuery} from 'react-query';
import {CreateSnippet, PaginatedSnippets, Snippet, UpdateSnippet} from './snippet.ts';
import {SnippetOperations, AnalyzeResult} from "./snippetOperations.ts";
import {PaginatedUsers} from "./users.ts";
import {TestCase} from "../types/TestCase.ts";
import {FileType} from "../types/FileType.ts";
import {Rule} from "../types/Rule.ts";
import {useAuth0} from "@auth0/auth0-react";

import {HttpSnippetOperations} from "./httpSnippetOperations.ts";
import {defaultFilters, SnippetFilters} from "../types/SnippetFilter.types.ts";
import {TestCaseResult} from "../types/TestCaseResult.ts";

export const useSnippetsOperations = () => {
    const {getAccessTokenSilently} = useAuth0()

    const snippetOperations: SnippetOperations = new HttpSnippetOperations(
        async () => {
            try {
                const token = await getAccessTokenSilently();
                console.log("Access Token:", token);
                return token;
            } catch (error) {
                console.error("Error getting token:", error);
                throw error;
            }
        }
    );

    return snippetOperations
}

export const useGetSnippets = (
    page: number = 0,
    pageSize: number = 10,
    filters: SnippetFilters = defaultFilters
) => {
    const snippetOperations = useSnippetsOperations();

    return useQuery<PaginatedSnippets, Error>(
        ['listSnippets', page, pageSize, filters],
        () => snippetOperations.listSnippetDescriptors(page, pageSize, filters)
    );
};

export const useGetSnippetById = (id: string) => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<Snippet | undefined, Error>(['snippet', id], () => snippetOperations.getSnippetById(id), {
        enabled: !!id,
    });
};

export const useCreateSnippet = ({onSuccess}: {
    onSuccess: () => void
}): UseMutationResult<Snippet, Error, CreateSnippet> => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<Snippet, Error, CreateSnippet>(createSnippet => snippetOperations.createSnippet(createSnippet), {onSuccess});
};

export const useUpdateSnippetById = ({onSuccess}: { onSuccess: () => void }): UseMutationResult<Snippet, Error, {
    id: string;
    updateSnippet: UpdateSnippet
}> => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<Snippet, Error, { id: string; updateSnippet: UpdateSnippet }>(
        ({id, updateSnippet}) => snippetOperations.updateSnippetById(id, updateSnippet), {
            onSuccess,
        }
    );
};

export const useGetUsers = (name: string = "", page: number = 0, pageSize: number = 10) => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<PaginatedUsers, Error>(['users', name, page, pageSize], () => snippetOperations.getUserFriends(name, page, pageSize));
};

export const useShareSnippet = () => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<
        Snippet,
        Error,
        { snippetId: string; userId: string; permissions?: { canRead: boolean; canEdit: boolean } }
    >(
        ({snippetId, userId, permissions}) => snippetOperations.shareSnippet(snippetId, userId, permissions)
    );
};

export const useGetTestCases = (snippetId: string) => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<TestCase[] | undefined, Error>(
        ['testCases', snippetId],
        () => snippetOperations.getTestCases(snippetId),
        {
            enabled: !!snippetId
        }
    );
}

export const usePostTestCase = ({ onSuccess }: { onSuccess?: (data: TestCase) => void } = {}) => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<TestCase, Error, Partial<TestCase>>(
        (tc) => snippetOperations.postTestCase(tc),
        { onSuccess }
    );
};

export const useUpsertTestCase = ({ onSuccess }: { onSuccess?: (data: TestCase) => void } = {}) => {
    const snippetOperations = useSnippetsOperations();

    return useMutation<TestCase, Error, Partial<TestCase>>(
        (tc) => {
            if (typeof (snippetOperations as any).upsertTestCase === 'function') {
                return (snippetOperations as any).upsertTestCase(tc);
            }
            return snippetOperations.postTestCase(tc);
        },
        { onSuccess }
    );
};

export const useRemoveTestCase = ({onSuccess}: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<string, Error, string>(
        ['removeTestCase'],
        (id) => snippetOperations.removeTestCase(id),
        {
            onSuccess,
        }
    );
};

export const useTestSnippet = () => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<
        TestCaseResult,
        Error,
        { snippetId: string; version: string; testId: number }
    >(
        ({ snippetId, version, testId }) =>
            snippetOperations.testSnippet(snippetId, version, testId)
    )
}

export const useGetFormatRules = () => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<Rule[], Error>('formatRules', () => snippetOperations.getFormatRules());
}

export const useModifyFormatRules = ({onSuccess}: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<Rule[], Error, Rule[]>(
        rule => snippetOperations.modifyFormatRule(rule),
        {onSuccess}
    );
}

export const useGetLintingRules = () => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<Rule[], Error>('lintingRules', () => snippetOperations.getLintingRules());
}

export const useModifyLintingRules = ({onSuccess}: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<Rule[], Error, Rule[]>(
        rule => snippetOperations.modifyLintingRule(rule),
        {onSuccess}
    );
}

export const useFormatSnippet = () => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<string, Error, { snippetId: string; version: string }>(
        ({ snippetId, version }) => snippetOperations.formatSnippet(snippetId, version)
    );
}

export const useAnalyzeSnippet = () => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<AnalyzeResult, Error, { snippetId: string; version: string }>(
        ({ snippetId, version }) => snippetOperations.analyzeSnippet(snippetId, version)
    );
}

export const useDeleteSnippet = ({onSuccess}: { onSuccess: () => void }) => {
    const snippetOperations = useSnippetsOperations()

    return useMutation<string, Error, string>(
        id => snippetOperations.deleteSnippet(id),
        {
            onSuccess,
        }
    );
}

export const useGetFileTypes = () => {
    const snippetOperations = useSnippetsOperations()

    return useQuery<FileType[], Error>('fileTypes', () => snippetOperations.getFileTypes());
}