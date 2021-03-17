# frozen_string_literal: true

class ActiveUserService
    # `request` is the Rails request object. You can access `request.env`
    # to retrieve the Basic Auth or Shibboleth auth variables
    def self.active_user(request)
        # If we're running in debug mode, we can fake the active user.
        # The config variable `active_user_override` is only set in debug/test mode,
        # so we can rely on it; if it exists, we're in debug mode.

        # If we're configured to use Apache's Basic Auth, use that. The alternative is Shibboleth (not yet implemented)
        if Rails.application.config.allow_basic_auth &&
               ActionController::HttpAuthentication::Basic
                   .has_basic_credentials?(request)
            credentials =
                ActionController::HttpAuthentication::Basic.decode_credentials(
                    request
                )
            utorid, _password = credentials.split(':')
            @user = User.find_by(utorid: utorid)

            return User.new(utorid: utorid, roles: grant_roles)
        end

        if (Rails.application.config.respond_to? :active_user_override) &&
               Rails.application.config.active_user_override
            @user = User.find_by(id: Rails.application.config.active_user_id)
            if @user
                return User.new(
                  utorid: @user.utorid, roles: grant_roles
              )
            else
                # If we're here, the database doesn't have the specified active user,
                # so createa fake one with all the permissions. We *do not* save this
                # user to the database.
                return(
                  User.new(
                    utorid: 'defaultactive', roles: %w[admin instructor ta]
                )
              )
            end
        end

        # rubocop:disable Style/RaiseArgs
        raise NotImplementedError.new 'active_user Route is not implemented yet for production mode'
        # rubocop:enable Style/RaiseArgs
    end

    def self.grant_roles
        utorid = @user.utorid
        # Every user has the TA role
        roles = @user ? @user.roles + %w[ta] : %w[ta]

        roles += %w[instructor] if Instructor.find_by(utorid: utorid)
        # Check if they are listed as an instructor for any course
        if Rails.application.config.always_admin.include?(utorid)
            roles += %w[admin]
        end

        roles
    end
end
