import { expect } from 'chai';
import proxyquire from 'proxyquire';
import sinon from 'sinon';

describe('GitHub', () => {
  let GitHub;
  let gitHubSpy;
  let gitHubAuthSpy;
  let MockGitHub;

  beforeEach(() => {
    gitHubSpy = sinon.spy();
    gitHubAuthSpy = sinon.spy();
    MockGitHub = class {
      constructor() {
        gitHubSpy();
      }

      authenticate() {
        gitHubAuthSpy();
      }
    };
    GitHub = proxyquire.noCallThru().load('../../src/util/github', {
      github: MockGitHub,
    }).default;
  });

  it('should read token from constructor', () => {
    expect(new GitHub('token1').token).to.equal('token1');
  });

  it('should fall back to token from environment', () => {
    process.env.GITHUB_TOKEN = 'abc123';
    expect(new GitHub().token).to.equal('abc123');
    delete process.env.GITHUB_TOKEN;
  });

  describe('getGitHub', () => {
    it('should create a new GitHubAPI', () => {
      const gh = new GitHub();
      expect(gitHubSpy.callCount).to.equal(0);
      gh.getGitHub();
      expect(gitHubSpy.callCount).to.equal(1);
    });

    it('should authenticate if a token is present', () => {
      const gh = new GitHub('token');
      expect(gitHubAuthSpy.callCount).to.equal(0);
      gh.getGitHub();
      expect(gitHubAuthSpy.callCount).to.equal(1);
    });

    it('should not authenticate if a token is not present', () => {
      const gh = new GitHub();
      expect(gitHubAuthSpy.callCount).to.equal(0);
      gh.getGitHub();
      expect(gitHubAuthSpy.callCount).to.equal(0);
    });
  });
});
