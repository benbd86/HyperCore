import styled from "styled-components";

const Wrapper = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return <Wrapper>{children}</Wrapper>;
}
